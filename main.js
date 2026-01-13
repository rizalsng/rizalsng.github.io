document.addEventListener('DOMContentLoaded', () => {
    // --- Medium Blog Integration ---
    const mediumUsername = 'fachrizal.sng';
    const rssJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${mediumUsername}`;
    const blogContainer = document.getElementById('blog-container');

    async function fetchMediumPosts() {
        try {
            const response = await fetch(rssJsonUrl);
            const data = await response.json();

            if (data.status === 'ok' && data.items.length > 0) {
                blogContainer.innerHTML = ''; // Clear loading state

                // Take regular items (posts), limiting to latest 5
                const posts = data.items.slice(0, 5);

                posts.forEach(post => {
                    // Extract a clean snippet/description if needed, or just use title
                    // Medium RSS content often has HTML, so we just link to it.

                    const blogItem = document.createElement('a');
                    blogItem.className = 'blog-item';
                    blogItem.href = post.link;
                    blogItem.target = '_blank';
                    blogItem.rel = 'noopener';

                    // Format Date
                    const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    blogItem.innerHTML = `
                        <div style="flex-grow: 1;">
                            <span class="blog-title">${post.title}</span>
                            <span class="blog-meta">${pubDate}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    `;

                    blogContainer.appendChild(blogItem);
                });

                // Re-initialize animations for new elements
                observeAnimations();
            } else {
                blogContainer.innerHTML = '<div class="blog-item" style="justify-content: center; color: var(--text-secondary);">No posts found.</div>';
            }
        } catch (error) {
            console.error('Error fetching Medium posts:', error);
            blogContainer.innerHTML = '<div class="blog-item" style="justify-content: center; color: var(--text-tertiary);">Failed to load posts.</div>';
        }
    }

    fetchMediumPosts();


    // --- Animations & Effects ---

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    function observeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Select elements to animate
        const animatedElements = document.querySelectorAll('.card, .blog-item, .section-header');

        animatedElements.forEach(el => {
            // Only set initial state if not already observed/animated to avoid jumpiness on re-runs
            if (!el.style.opacity) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                observer.observe(el);
            }
        });
    }

    // Initial call for static content
    observeAnimations();

    // Mouse Tracking for Ambient Light
    const ambientLight = document.querySelector('.ambient-light');
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateLight() {
        // Smooth easing
        const ease = 0.1;

        currentX += (mouseX - currentX) * ease;
        currentY += (mouseY - currentY) * ease;

        if (ambientLight) {
            ambientLight.style.left = `${currentX}px`;
            ambientLight.style.top = `${currentY}px`;
        }

        requestAnimationFrame(animateLight);
    }

    animateLight();
});
