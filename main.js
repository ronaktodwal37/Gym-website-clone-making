// Basic interactivity for the gym website

document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.95)';
            header.style.padding = '0.5rem 0';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.8)';
            header.style.padding = '0';
        }
    });

    // Mobile menu toggle (placeholder for actual functionality)
    const hamburger = document.querySelector('.hamburger');
    hamburger.addEventListener('click', () => {
        alert('Mobile menu clicked! In a full implementation, this would toggle a sidebar.');
    });

    // Smooth scroll for hash links only
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple scroll animation observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .pricing-card, .section-title, .testimonial-card').forEach(el => {
        el.style.opacity = '0'; // Initial state for observer
        observer.observe(el);
    });

    // Video Modal Logic (supports multiple play buttons using data-video)
    const videoModal = document.getElementById('videoModal');
    const playBtns = document.querySelectorAll('.play-btn');
    const closeModal = document.querySelector('.close-modal');
    const yogaVideo = document.getElementById('yogaVideo');

    const hideModal = () => {
        if (!videoModal) return;
        videoModal.classList.remove('active');
        if (yogaVideo) yogaVideo.src = ""; // stop playback
        document.body.style.overflow = 'auto';
    };

    if (playBtns && playBtns.length && videoModal && closeModal && yogaVideo) {
        const videoOpenLink = document.getElementById('videoOpenLink');
        playBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let src = btn.getAttribute('data-video') || btn.dataset.video || '';
                if (!src) return;

                // Extract YouTube ID if a full URL or embed URL was provided
                let ytId = null;
                // match common youtube patterns
                const idMatch = src.match(/(?:v=|embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
                if (idMatch && idMatch[1]) ytId = idMatch[1];
                else if (/^[A-Za-z0-9_-]{6,}$/.test(src)) ytId = src; // already an id

                // prefer privacy-enhanced embed domain
                if (ytId) {
                    const embed = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1`;
                    yogaVideo.src = embed;
                    if (videoOpenLink) videoOpenLink.href = `https://www.youtube.com/watch?v=${ytId}`;
                } else {
                    // fallback: set whatever was provided
                    yogaVideo.src = src;
                    if (videoOpenLink) videoOpenLink.href = src;
                }

                videoModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModal.addEventListener('click', hideModal);
        videoModal.addEventListener('click', (e) => { if (e.target === videoModal) hideModal(); });
    }

    // Testimonials: load from localStorage and handle submissions
    const testimonialsKey = 'ironpeak_testimonials';
    const testimonialsContainer = document.querySelector('.testimonials-container');
    const testimonialForm = document.getElementById('testimonialForm');
    const tSuccess = document.getElementById('t-success');

    const renderTestimonial = (t) => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        // initials
        const initials = (t.name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || 'U';
        avatar.textContent = initials;

        const meta = document.createElement('div');
        const h4 = document.createElement('h4'); h4.textContent = t.name || 'Anonymous';
        const pRole = document.createElement('p'); pRole.textContent = t.role || '';

        meta.appendChild(h4); meta.appendChild(pRole);
        userInfo.appendChild(avatar); userInfo.appendChild(meta);

        const quote = document.createElement('p'); quote.className = 'quote'; quote.textContent = t.message || '';
        const stars = document.createElement('div'); stars.className = 'stars';
        stars.textContent = '★'.repeat(Math.max(1, Math.min(5, parseInt(t.rating) || 5)));

        card.appendChild(userInfo);
        card.appendChild(quote);
        card.appendChild(stars);

        // prepend new testimonials so newest appears first
        if (testimonialsContainer) testimonialsContainer.insertBefore(card, testimonialsContainer.firstChild);
    };

    // load saved testimonials
    try {
        const saved = JSON.parse(localStorage.getItem(testimonialsKey) || '[]');
        if (Array.isArray(saved)) {
            saved.forEach(renderTestimonial);
        }
    } catch (e) {
        console.warn('Could not load testimonials', e);
    }

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(testimonialForm);
            const t = {
                name: formData.get('name')?.toString().trim(),
                role: formData.get('role')?.toString().trim(),
                message: formData.get('message')?.toString().trim(),
                rating: formData.get('rating') || '5',
                created: Date.now()
            };
            if (!t.name || !t.message) return;

            // persist
            try {
                const existing = JSON.parse(localStorage.getItem(testimonialsKey) || '[]');
                existing.unshift(t);
                localStorage.setItem(testimonialsKey, JSON.stringify(existing.slice(0, 100))); // keep 100 max
            } catch (err) { console.warn('Could not save testimonial', err); }

            // render
            renderTestimonial(t);

            // show success message
            if (tSuccess) {
                tSuccess.style.display = 'block';
                setTimeout(() => { tSuccess.style.display = 'none'; }, 3000);
            }

            testimonialForm.reset();
        });
    }
});
