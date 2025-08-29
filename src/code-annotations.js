/**
 * Code Annotations - MkDocs Material style annotations for Mintlify
 * Converts annotations like # (1)! in code blocks to interactive tooltips
 */

console.log('🎯 Code Annotations script loaded!');

(function() {
    'use strict';
    
    console.log('🚀 Code Annotations initializing...');

    // Configuration - Simplified patterns with (+) syntax
    const ANNOTATION_PATTERNS = [
        // Python, JavaScript, TypeScript comments: # (+) explanation text
        /(?:\/\/|#)\s*\(\+\)\s*([^\n\r]*)/g,
        // HTML comments: <!-- (+) explanation text -->
        /<!--\s*\(\+\)\s*([^-]*?)-->/g,
        // CSS comments: /* (+) explanation text */
        /\/\*\s*\(\+\)\s*([^*]*?)\*\//g,
        // SQL comments: -- (+) explanation text
        /--\s*\(\+\)\s*([^\n\r]*)/g
    ];

    /**
     * Find and parse annotations from code blocks
     */
    function processCodeAnnotations() {
        // Find all code blocks
        const codeBlocks = document.querySelectorAll('pre code, code');
        
        codeBlocks.forEach(codeBlock => {
            // Skip if already processed
            if (codeBlock.hasAttribute('data-annotations-processed')) {
                return;
            }
            
            let codeContent = codeBlock.innerHTML;
            const annotations = new Map();
            let hasAnnotations = false;

            // Process each annotation pattern
            ANNOTATION_PATTERNS.forEach(pattern => {
                codeContent = codeContent.replace(pattern, (match, explanationText) => {
                    hasAnnotations = true;
                    console.log(`✨ Found annotation: ${match}`);
                    console.log(`📝 Explanation: "${explanationText}"`);
                    
                    // Clean up the explanation text
                    const explanation = explanationText ? explanationText.trim() : 'Click for details';
                    
                    // Replace with HTML annotation marker using + symbol
                    return `<span class="code-annotation">
                        <span class="code-annotation-marker">+</span>
                        <div class="code-annotation-tooltip">${explanation}</div>
                    </span>`;
                });
            });

            // Update code block if annotations were found
            if (hasAnnotations) {
                codeBlock.innerHTML = codeContent;
                codeBlock.setAttribute('data-annotations-processed', 'true');
                
                // Add event listeners for interactions
                addAnnotationInteractions(codeBlock);
            }
        });
    }



    /**
     * Add interactive behavior to annotations
     */
    function addAnnotationInteractions(codeBlock) {
        const annotations = codeBlock.querySelectorAll('.code-annotation');
        
        annotations.forEach(annotation => {
            const tooltip = annotation.querySelector('.code-annotation-tooltip');
            
            // Position tooltip to avoid edge overflow
            annotation.addEventListener('mouseenter', () => {
                positionTooltip(annotation, tooltip);
            });
            
            // Click to toggle tooltip for mobile/accessibility
            annotation.addEventListener('click', (e) => {
                e.preventDefault();
                annotation.classList.toggle('active');
                
                // Close other active tooltips in the same code block
                annotations.forEach(other => {
                    if (other !== annotation) {
                        other.classList.remove('active');
                    }
                });
            });
        });
        
        // Close tooltips when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.code-annotation')) {
                annotations.forEach(annotation => {
                    annotation.classList.remove('active');
                });
            }
        });
    }

    /**
     * Position tooltip to avoid edge overflow
     */
    function positionTooltip(annotation, tooltip) {
        // Reset classes
        annotation.classList.remove('tooltip-right');
        
        // Get viewport and element dimensions
        const rect = annotation.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Check if tooltip would overflow on the right side of viewport
        // Default: tooltip appears to the right of the annotation
        if (rect.right + 420 > viewportWidth) {
            // If it would overflow, show it on the left instead
            annotation.classList.add('tooltip-right');
        }
    }

    /**
     * Initialize the annotation system
     */
    function init() {
        console.log('🔧 Code Annotations init() called, document.readyState:', document.readyState);
        
        // Process annotations on page load
        if (document.readyState === 'loading') {
            console.log('📚 Document still loading, adding DOMContentLoaded listener');
            document.addEventListener('DOMContentLoaded', processCodeAnnotations);
        } else {
            console.log('📚 Document ready, processing annotations immediately');
            processCodeAnnotations();
        }
        
        // Re-process annotations when new content is loaded (for SPA navigation)
        const observer = new MutationObserver((mutations) => {
            let shouldReprocess = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if new code blocks were added
                            if (node.matches('pre, code, .highlight, .code-block') ||
                                node.querySelector('pre, code, .highlight, .code-block')) {
                                shouldReprocess = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReprocess) {
                // Debounce reprocessing to avoid excessive calls
                clearTimeout(window.annotationReprocessTimeout);
                window.annotationReprocessTimeout = setTimeout(processCodeAnnotations, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when script loads
    init();
})();