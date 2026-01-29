document.addEventListener('DOMContentLoaded', () => {
    const projectItems = document.querySelectorAll('.project-item');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewImg = document.getElementById('preview-img');

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const imgSrc = item.getAttribute('data-img');
            if (imgSrc) {
                previewImg.src = imgSrc;
                previewOverlay.style.opacity = '1';
            }
        });

        item.addEventListener('mouseleave', () => {
            previewOverlay.style.opacity = '0';
        });
        
        // Optional: Move preview slightly with mouse for dynamic feel
        item.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            
            // Very subtle parallax could go here, but CSS flex centering handles position well.
            // Leaving blank to rely on CSS centering for stability.
        });
    });

    console.log('UI Initialized: Project preview interactions ready.');

    // --- Medium Feed Integration ---
    const MEDIUM_RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@fachrizal.sng';
    const mediumContainer = document.getElementById('medium-container');

    fetch(MEDIUM_RSS_URL)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items.length > 0) {
                mediumContainer.innerHTML = ''; // Clear loading state
                
                data.items.slice(0, 5).forEach((post, index) => {
                    const date = new Date(post.pubDate);
                    const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    const id = `0${index + 1}`;
                    
                    // Create Link Element
                    const link = document.createElement('a');
                    link.href = post.link;
                    link.target = '_blank';
                    link.className = 'project-item';
                    
                    // HTML Structure matching the list style
                    link.innerHTML = `
                        <span class="project-id">${id}</span>
                        <span class="project-name">${post.title.toUpperCase()}</span>
                        <span class="project-year">${formattedDate}</span>
                    `;
                    
                    mediumContainer.appendChild(link);
                });
            } else {
                mediumContainer.innerHTML = `
                    <div class="project-item" style="border:none; pointer-events: none;">
                        <span class="project-id">ERR</span>
                        <span class="project-name" style="color: var(--text-muted);">SIGNAL LOST (NO POSTS FOUND)</span>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching Medium feed:', error);
            mediumContainer.innerHTML = `
                <div class="project-item" style="border:none; pointer-events: none;">
                    <span class="project-id">ERR</span>
                    <span class="project-name" style="color: var(--text-muted);">CONNECTION FAILED</span>
                </div>
            `;
        });
});
