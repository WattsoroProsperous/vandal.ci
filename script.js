/**
 * VANDAL Restaurant - JavaScript
 * Interactive features and animations
 */

// Initialize preloader immediately
initPreloader();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initNavigation();
    initScrollEffects();
    initScrollAnimations();
    initSmoothScroll();
    initLazyLoading();
    initGalleryVideos();
});

/**
 * Preloader with image loading progress
 */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-bar');
    const percentageText = document.getElementById('preloader-percentage');

    if (!preloader) return;

    // Get all images to preload
    const imagesToLoad = [];

    // Critical images (above the fold)
    const criticalImages = [
        'assets/logo.jpg',
        'assets/logo-remove.png'
    ];

    // Add critical images first
    criticalImages.forEach(src => {
        imagesToLoad.push({ src, priority: 'high' });
    });

    // Wait for DOM to be ready to find all other images
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => collectAndLoadImages());
    } else {
        collectAndLoadImages();
    }

    function collectAndLoadImages() {
        // Find all images in the page
        const pageImages = document.querySelectorAll('img[src]');
        pageImages.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !imagesToLoad.find(i => i.src === src)) {
                imagesToLoad.push({ src, priority: 'normal' });
            }
        });

        // Also preload background videos poster frames if any
        const videos = document.querySelectorAll('video[poster]');
        videos.forEach(video => {
            const poster = video.getAttribute('poster');
            if (poster) {
                imagesToLoad.push({ src: poster, priority: 'normal' });
            }
        });

        loadAllImages();
    }

    function loadAllImages() {
        let loadedCount = 0;
        const totalImages = imagesToLoad.length;

        if (totalImages === 0) {
            completeLoading();
            return;
        }

        // Update progress
        function updateProgress() {
            loadedCount++;
            const percentage = Math.round((loadedCount / totalImages) * 100);

            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            if (percentageText) {
                percentageText.textContent = percentage + '%';
            }

            if (loadedCount >= totalImages) {
                completeLoading();
            }
        }

        // Load each image
        imagesToLoad.forEach(imageData => {
            const img = new Image();
            img.onload = updateProgress;
            img.onerror = updateProgress; // Count errors as loaded to not block
            img.src = imageData.src;
        });

        // Fallback: complete after max 5 seconds even if not all loaded
        setTimeout(() => {
            if (!preloader.classList.contains('loaded')) {
                completeLoading();
            }
        }, 5000);
    }

    function completeLoading() {
        // Ensure we show 100%
        if (progressBar) progressBar.style.width = '100%';
        if (percentageText) percentageText.textContent = '100%';

        // Small delay to show 100% before hiding
        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.style.overflow = '';

            // Remove preloader from DOM after animation
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 300);
    }

    // Prevent scrolling while preloader is active
    document.body.style.overflow = 'hidden';
}

/**
 * Navigation functionality
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Active link highlighting based on scroll position
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
}

/**
 * Scroll effects for navbar
 */
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const scrollY = window.scrollY;

        // Add scrolled class when scrolled past hero
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll direction (optional - commented out)
        // if (scrollY > lastScrollY && scrollY > 500) {
        //     navbar.style.transform = 'translateY(-100%)';
        // } else {
        //     navbar.style.transform = 'translateY(0)';
        // }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}

/**
 * Scroll animations for elements
 */
function initScrollAnimations() {
    // Add animation class to elements
    const animatedElements = document.querySelectorAll(
        '.section-header, .about-text, .about-video, .feature, ' +
        '.menu-item, .cocktail-video, .cocktail-info, .event-card, ' +
        '.contact-info, .map-container, .reservation-content'
    );

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Staggered animation for grid items
    const gridContainers = document.querySelectorAll('.menu-grid, .events-grid, .about-features');

    gridContainers.forEach(container => {
        const items = container.children;
        Array.from(items).forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.1}s`;
        });
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Lazy loading for images and videos
 */
function initLazyLoading() {
    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyImages = document.querySelectorAll('img');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Lazy load videos (excluding gallery videos which have their own handler)
    const videos = document.querySelectorAll('video:not(.gallery-video)');

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Play video when in view (only for background/ambient videos)
                if (video.hasAttribute('autoplay') && video.hasAttribute('muted')) {
                    video.play().catch(() => {
                        // Autoplay might be blocked, that's okay
                    });
                }
            } else {
                // Pause video when out of view to save resources
                video.pause();
            }
        });
    }, { threshold: 0.3 });

    videos.forEach(video => {
        videoObserver.observe(video);
    });
}

/**
 * Gallery videos - exclusive playback (only one plays at a time)
 */
function initGalleryVideos() {
    const galleryVideos = document.querySelectorAll('.gallery-video');

    if (galleryVideos.length === 0) return;

    // Pause all other gallery videos when one starts playing
    galleryVideos.forEach(video => {
        video.addEventListener('play', function() {
            galleryVideos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        });
    });

    // Handle the featured video with play button for sound
    const featuredVideo = document.getElementById('featured-video');
    const playButton = document.getElementById('play-featured-video');

    if (featuredVideo && playButton) {
        setupVideoWithPlayButton(featuredVideo, playButton, galleryVideos);
    }

    // Handle the main about video - autoplay with sound when section is visible
    const mainAboutVideo = document.getElementById('main-about-video');
    const mainPlayButton = document.getElementById('play-main-video');

    if (mainAboutVideo && mainPlayButton) {
        setupMainAboutVideo(mainAboutVideo, mainPlayButton, galleryVideos);
    }
}

/**
 * Setup video with play button for sound activation
 */
function setupVideoWithPlayButton(video, playButton, allGalleryVideos) {
    // Click on play button to start video with sound
    playButton.addEventListener('click', function() {
        // Pause all other gallery videos
        if (allGalleryVideos) {
            allGalleryVideos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        }

        video.muted = false;
        video.play().then(() => {
            playButton.classList.add('hidden');
        }).catch((error) => {
            console.log('Playback failed:', error);
        });
    });

    // Hide play button if video is played via controls
    video.addEventListener('play', function() {
        playButton.classList.add('hidden');
    });

    // Show play button again if video ends
    video.addEventListener('ended', function() {
        playButton.classList.remove('hidden');
    });
}

/**
 * Setup main about video - autoplay with sound when section is visible
 */
function setupMainAboutVideo(video, playButton, allGalleryVideos) {
    let isPlaying = false;
    let userHasInteracted = false;

    // Function to pause other videos
    const pauseOtherVideos = () => {
        if (allGalleryVideos) {
            allGalleryVideos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        }
    };

    // Function to start video when section is visible
    const startVideo = () => {
        pauseOtherVideos();

        // If user already interacted, play with sound directly
        if (userHasInteracted) {
            video.muted = false;
            video.play().then(() => {
                playButton.classList.add('hidden');
                isPlaying = true;
            }).catch(() => {
                playButton.classList.remove('hidden');
            });
            return;
        }

        // First attempt: try with sound (will work if user interacted with page)
        video.muted = false;
        video.play().then(() => {
            // Success with sound!
            playButton.classList.add('hidden');
            isPlaying = true;
            userHasInteracted = true;
        }).catch(() => {
            // Sound blocked, play muted and show button for sound
            video.muted = true;
            video.play().then(() => {
                isPlaying = true;
                // Show button so user can enable sound
                playButton.classList.remove('hidden');
            }).catch(() => {
                // Even muted playback failed
                playButton.classList.remove('hidden');
            });
        });
    };

    // Click/touch on play button to enable sound
    const handlePlayButtonClick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        userHasInteracted = true;
        pauseOtherVideos();
        video.muted = false;
        video.play().then(() => {
            playButton.classList.add('hidden');
            isPlaying = true;
        }).catch(() => {
            // Fallback: just unmute if already playing
            if (!video.paused) {
                video.muted = false;
                playButton.classList.add('hidden');
            }
        });
    };

    playButton.addEventListener('click', handlePlayButtonClick);
    playButton.addEventListener('touchend', handlePlayButtonClick, { passive: false });

    // Track user interaction on the page
    const markInteraction = () => {
        userHasInteracted = true;
    };
    document.addEventListener('click', markInteraction, { once: true });
    document.addEventListener('touchstart', markInteraction, { once: true });

    // Hide play button when video plays with sound
    video.addEventListener('play', function() {
        isPlaying = true;
        if (!video.muted) {
            playButton.classList.add('hidden');
        }
    });

    // Show play button again if video ends
    video.addEventListener('ended', function() {
        playButton.classList.remove('hidden');
        isPlaying = false;
    });

    video.addEventListener('pause', function() {
        isPlaying = false;
    });

    // Intersection Observer to autoplay when section is visible
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Section is visible - start video
                if (!isPlaying) {
                    startVideo();
                }
            } else {
                // Section is not visible - pause video
                if (!video.paused) {
                    video.pause();
                    isPlaying = false;
                }
            }
        });
    }, { threshold: 0.3 });

    videoObserver.observe(video);
}

/**
 * Parallax effect for hero section (optional enhancement)
 */
function initParallax() {
    const heroVideo = document.querySelector('.hero-video');

    if (heroVideo) {
        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrollY < heroHeight) {
                heroVideo.style.transform = `translateY(${scrollY * 0.5}px)`;
            }
        });
    }
}

/**
 * Form validation (for future reservation form)
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]{8,}$/;
    return re.test(phone);
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Handle page visibility for video playback
 */
document.addEventListener('visibilitychange', function() {
    const backgroundVideos = document.querySelectorAll('video:not(.gallery-video)');
    const galleryVideos = document.querySelectorAll('.gallery-video');

    if (document.hidden) {
        // Pause all videos when page is hidden
        backgroundVideos.forEach(video => video.pause());
        galleryVideos.forEach(video => video.pause());
    } else {
        // Only auto-resume background/ambient videos (muted autoplay)
        backgroundVideos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && video.hasAttribute('autoplay') && video.hasAttribute('muted')) {
                video.play().catch(() => {});
            }
        });
        // Gallery videos require user interaction, don't auto-resume
    }
});

