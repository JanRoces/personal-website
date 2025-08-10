document.addEventListener('DOMContentLoaded', function () {
  var target = document.getElementById('typed-text');
  var defaultDelayMs = 90;
  var extendedDelayMs = 1000;

  var segments = [
    { text: 'hello!', bold: true, color: '#EECB52' },
    { text: ' My name is ', bold: false, color: '#FFFFFF' },
    { text: 'Jan Roces', bold: true, color: '#76C5DD' },
    { text: '\nI am a ', bold: false, color: '#FFFFFF' },
    { text: 'Software Engineer', bold: true, color: '#FF5050' },
    { text: '.\nWelcome to my website!', bold: false, color: '#FFFFFF' },
  ];

  var segmentIndex = 0;
  var charIndex = 0;
  var currentNode = null;

  function getOrCreateCurrentNode() {
    if (currentNode) return currentNode;
    var seg = segments[segmentIndex];
    if (seg.bold) {
      currentNode = document.createElement('strong');
      currentNode.style.color = seg.color;
      target.appendChild(currentNode);
    } else {
      currentNode = document.createTextNode('');
      target.appendChild(currentNode);
    }
    return currentNode;
  }

  function typeNextCharacter() {
    if (segmentIndex >= segments.length) return;

    var seg = segments[segmentIndex];
    var node = getOrCreateCurrentNode();
    var nextChar = seg.text.charAt(charIndex);

    if (seg.bold) {
      node.textContent += nextChar;
    } else {
      node.nodeValue += nextChar;
    }

    charIndex += 1;

    var nextDelay = defaultDelayMs;

    if (target.textContent.endsWith('hello!') || nextChar === '\n') {
      nextDelay = extendedDelayMs;
    }

    if (charIndex >= seg.text.length) {
      segmentIndex += 1;
      charIndex = 0;
      currentNode = null;
    }

    setTimeout(typeNextCharacter, nextDelay);
  }

  var containerProfile = document.querySelector('.container-profile');
  var socialLinks = document.querySelector('.container-social-links');
  var linkAbout = document.getElementById('link-about');
  var linkProjects = document.getElementById('link-projects');
  var aboutContent = document.getElementById('about-content');
  var projectsContent = document.getElementById('projects-content');
  var containerLinks = document.querySelector('.container-links');
  var linkIndicator = document.getElementById('link-indicator');
  var started = false;

  function startTypingOnce() {
    if (started) return;
    started = true;
    if (socialLinks) {
      socialLinks.classList.remove('stagger-prep');
      socialLinks.classList.add('stagger-in');

      if (containerLinks) {
        var lastIcon = socialLinks.querySelector(
          '.container-social-link:last-child',
        );
        if (lastIcon) {
          var onEnd = function (e) {
            if (e.propertyName !== 'opacity') return;
            lastIcon.removeEventListener('transitionend', onEnd);
            containerLinks.classList.add('links-in');
          };
          lastIcon.addEventListener('transitionend', onEnd);
        } else {
          containerLinks.classList.add('links-in');
        }
      }
    }
    typeNextCharacter();
  }

  if (containerProfile) {
    var computed = window.getComputedStyle(containerProfile);
    if (computed.animationName && computed.animationName !== 'none') {
      containerProfile.addEventListener('animationend', startTypingOnce, {
        once: true,
      });
    } else {
      startTypingOnce();
    }
  } else {
    startTypingOnce();
  }

  function moveIndicatorTo(element) {
    if (!element || !linkIndicator || !containerLinks) return;
    var rect = element.getBoundingClientRect();
    var parentRect = containerLinks.getBoundingClientRect();
    var left = rect.left - parentRect.left;
    linkIndicator.style.width = rect.width + 'px';
    linkIndicator.style.transform = 'translateX(' + left + 'px)';
    containerLinks.classList.add('indicator-visible');
    linkAbout.classList.toggle('active', element === linkAbout);
    linkProjects.classList.toggle('active', element === linkProjects);
  }

  function setActiveLink(element) {
    linkAbout.classList.toggle('active', element === linkAbout);
    linkProjects.classList.toggle('active', element === linkProjects);
  }

  var isTransitioningSection = false;

  function openSection(targetContent, targetLink) {
    if (!targetContent) return;
    if (isTransitioningSection) return;

    var openEl = null;
    if (aboutContent && aboutContent.classList.contains('is-open'))
      openEl = aboutContent;
    if (projectsContent && projectsContent.classList.contains('is-open'))
      openEl = projectsContent;

    // Already showing target
    if (openEl === targetContent) {
      moveIndicatorTo(targetLink);
      setActiveLink(targetLink);
      return;
    }

    // Move indicator immediately for responsiveness
    moveIndicatorTo(targetLink);

    // If nothing open, just open target
    if (!openEl) {
      targetContent.classList.add('is-open');
      setActiveLink(targetLink);
      return;
    }

    // Close current, then open target on transition end
    isTransitioningSection = true;
    var onEnd = function (e) {
      if (e.propertyName !== 'max-height') return;
      openEl.removeEventListener('transitionend', onEnd);
      isTransitioningSection = false;
      targetContent.classList.add('is-open');
      setActiveLink(targetLink);
    };
    openEl.addEventListener('transitionend', onEnd);
    openEl.classList.remove('is-open');
  }

  if (linkAbout) {
    linkAbout.addEventListener('click', function () {
      openSection(aboutContent, linkAbout);
    });
  }

  if (linkProjects) {
    linkProjects.addEventListener('click', function () {
      openSection(projectsContent, linkProjects);
    });
  }

  window.addEventListener('resize', function () {
    var active = linkAbout.classList.contains('active')
      ? linkAbout
      : linkProjects.classList.contains('active')
        ? linkProjects
        : null;
    if (active) moveIndicatorTo(active);
  });
});
