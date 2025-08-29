/**
 * Code Annotations - MkDocs Material style annotations for Mintlify
 * Converts annotations like # (1)! in code blocks to interactive tooltips
 */

console.log('🎯 Code Annotations script loaded!');

(function() {
    'use strict';
    
    console.log('🚀 Code Annotations initializing...');

    // Configuration - Updated patterns to capture explanation text
    const ANNOTATION_PATTERNS = [
        // Python, JavaScript, TypeScript comments: # (1)! explanation text
        /(?:\/\/|#)\s*\((\d+)\)!\s*([^\n\r]*)/g,
        // HTML comments: <!-- (1)! explanation text -->
        /<!--\s*\((\d+)\)!\s*([^-]*?)-->/g,
        // CSS comments: /* (1)! explanation text */
        /\/\*\s*\((\d+)\)!\s*([^*]*?)\*\//g,
        // SQL comments: -- (1)! explanation text
        /--\s*\((\d+)\)!\s*([^\n\r]*)/g
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
                codeContent = codeContent.replace(pattern, (match, number, explanationText) => {
                    hasAnnotations = true;
                    console.log(`✨ Found annotation: ${match}`);
                    console.log(`📝 Number: ${number}, Explanation: "${explanationText}"`);
                    
                    // Clean up the explanation text
                    const explanation = explanationText ? explanationText.trim() : `Annotation ${number}`;
                    
                    if (explanation && explanation !== `Annotation ${number}`) {
                        annotations.set(number, explanation);
                    }
                    
                    // Replace with HTML annotation marker
                    return `<span class="code-annotation" data-annotation="${number}">
                        <span class="code-annotation-marker">${number}</span>
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
        annotation.classList.remove('tooltip-left', 'tooltip-right');
        
        // Get viewport and element dimensions
        const rect = annotation.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Check if tooltip would overflow on the right
        if (rect.left + tooltipRect.width / 2 > viewportWidth - 20) {
            annotation.classList.add('tooltip-right');
        }
        // Check if tooltip would overflow on the left
        else if (rect.left - tooltipRect.width / 2 < 20) {
            annotation.classList.add('tooltip-left');
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