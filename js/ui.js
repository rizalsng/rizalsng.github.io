document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const GLYPHS = '!<>-_\\/[]{}=+*^?#';
    function scramble(el, duration = 700) {
        const original = el.textContent;
        const len = original.length;
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const reveal = Math.floor(p * len);
            let out = original.slice(0, reveal);
            for (let i = reveal; i < len; i++) {
                out += original[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (!reducedMotion) {
        document.querySelectorAll('.title-line, .meta-item .value').forEach((el, i) => {
            setTimeout(() => scramble(el), 150 + i * 120);
        });
    }

    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const fmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });
        const tickTime = () => { timeEl.textContent = fmt.format(new Date()) + ' WIB'; };
        tickTime();
        setInterval(tickTime, 1000);
    }

    const coordEl = document.getElementById('coord-readout');
    let coordPending = false;

    function toDMS(value, pos, neg) {
        const abs = Math.abs(value);
        const d = Math.floor(abs);
        const mFloat = (abs - d) * 60;
        const m = Math.floor(mFloat);
        const s = Math.floor((mFloat - m) * 60);
        const dir = value >= 0 ? pos : neg;
        return `${d}\u00B0${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"${dir}`;
    }

    function updateCoords(e) {
        const lat = -6.2 + (0.5 - e.clientY / window.innerHeight) * 8;
        const lon = 106.8 + (e.clientX / window.innerWidth - 0.5) * 16;
        coordEl.textContent = `${toDMS(lat, 'N', 'S')} ${toDMS(lon, 'E', 'W')}`;
    }

    const previewOverlay = document.querySelector('.preview-overlay');
    const previewImg = document.getElementById('preview-img');
    const previewContainer = document.querySelector('.preview-img-container');
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 60;
        targetY = (e.clientY / window.innerHeight - 0.5) * 60;

        if (coordEl && !coordPending) {
            coordPending = true;
            requestAnimationFrame(() => {
                updateCoords(e);
                coordPending = false;
            });
        }
    });

    if (!reducedMotion) {
        (function parallax() {
            curX += (targetX - curX) * 0.06;
            curY += (targetY - curY) * 0.06;
            if (previewContainer) {
                previewContainer.style.transform = `translate(${curX}px, ${curY}px)`;
            }
            requestAnimationFrame(parallax);
        })();
    }

    function bindPreview(item) {
        const show = () => {
            const imgSrc = item.getAttribute('data-img');
            if (imgSrc) {
                previewImg.src = imgSrc;
                previewOverlay.style.opacity = '1';
            }
        };
        const hide = () => { previewOverlay.style.opacity = '0'; };
        item.addEventListener('mouseenter', show);
        item.addEventListener('mouseleave', hide);
        item.addEventListener('focus', show);
        item.addEventListener('blur', hide);
    }

    document.querySelectorAll('.project-item[data-img]').forEach(bindPreview);

    const MEDIUM_RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@fachrizal.sng';
    const CACHE_KEY = 'medium-feed-cache';
    const mediumContainer = document.getElementById('medium-container');

    function makeStatusRow(id, text) {
        const li = document.createElement('li');
        li.className = 'list-status';
        const idSpan = document.createElement('span');
        idSpan.className = 'project-id';
        idSpan.textContent = id;
        const textSpan = document.createElement('span');
        textSpan.className = 'status-text';
        textSpan.textContent = text;
        li.append(idSpan, textSpan);
        return li;
    }

    function renderPosts(items) {
        mediumContainer.textContent = '';
        items.slice(0, 5).forEach((post, index) => {
            const date = new Date(post.pubDate);
            const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = post.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'project-item';

            const idSpan = document.createElement('span');
            idSpan.className = 'project-id';
            idSpan.textContent = `0${index + 1}`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'project-name';
            nameSpan.textContent = post.title.toUpperCase();

            const dateSpan = document.createElement('span');
            dateSpan.className = 'project-year';
            dateSpan.textContent = formattedDate;

            link.append(idSpan, nameSpan, dateSpan);
            li.appendChild(link);
            mediumContainer.appendChild(li);
        });
    }

    let rendered = false;
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && cached.items && cached.items.length > 0) {
            renderPosts(cached.items);
            rendered = true;
        }
    } catch (e) { }

    fetch(MEDIUM_RSS_URL)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items.length > 0) {
                renderPosts(data.items);
                rendered = true;
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        fetchedAt: Date.now(),
                        items: data.items.slice(0, 5).map(p => ({ title: p.title, link: p.link, pubDate: p.pubDate }))
                    }));
                } catch (e) { }
            } else if (!rendered) {
                mediumContainer.textContent = '';
                mediumContainer.appendChild(makeStatusRow('ERR', 'SIGNAL LOST (NO POSTS FOUND)'));
            }
        })
        .catch(() => {
            if (!rendered) {
                mediumContainer.textContent = '';
                mediumContainer.appendChild(makeStatusRow('ERR', 'CONNECTION FAILED'));
            }
        });
});
