document.addEventListener('DOMContentLoaded', function init() {
  const TYPE_DEFAULT_DELAY_MS = 90;
  const TYPE_EXTENDED_DELAY_MS = 1000;
  const SOCIAL_LAST_ICON_TRANSITION_PROP = 'opacity';

  var elements = {
    containerProfile: document.querySelector('.container-profile'),
    socialLinks: document.querySelector('.container-social-links'),
    containerLinks: document.querySelector('.container-links'),
    linkAbout: document.getElementById('link-about'),
    linkProjects: document.getElementById('link-projects'),
    aboutContent: document.getElementById('about-content'),
    projectsContent: document.getElementById('projects-content'),
    linkIndicator: document.getElementById('link-indicator'),
    typedTarget: document.getElementById('typed-text'),
  };

  function onTransitionEndOnce(element, propertyName, handler) {
    if (!element) {
      return;
    }

    const wrapped = function (evt) {
      if (evt.propertyName !== propertyName) {
        return;
      }

      element.removeEventListener('transitionend', wrapped);
      handler(evt);
    };

    element.addEventListener('transitionend', wrapped);
  }

  function setActiveLink(element) {
    if (!elements.linkAbout || !elements.linkProjects) {
      return;
    }

    elements.linkAbout.classList.toggle(
      'active',
      element === elements.linkAbout,
    );

    elements.linkProjects.classList.toggle(
      'active',
      element === elements.linkProjects,
    );
  }

  function moveIndicatorTo(element) {
    if (!element || !elements.linkIndicator || !elements.containerLinks) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const parentRect = elements.containerLinks.getBoundingClientRect();
    const left = rect.left - parentRect.left;

    elements.linkIndicator.style.width = rect.width + 'px';
    elements.linkIndicator.style.transform = 'translateX(' + left + 'px)';
    elements.containerLinks.classList.add('indicator-visible');

    setActiveLink(element);
  }

  const typewriterState = {
    segments: [
      { text: 'hello!', bold: true, color: '#EECB52' },
      { text: ' My name is ', bold: false, color: '#FFFFFF' },
      { text: 'Jan Roces', bold: true, color: '#76C5DD' },
      { text: '\nI am a ', bold: false, color: '#FFFFFF' },
      { text: 'Software Engineer', bold: true, color: '#FF5050' },
      { text: '.\nWelcome to my website!', bold: false, color: '#FFFFFF' },
    ],
    segmentIndex: 0,
    charIndex: 0,
    currentNode: null,
  };

  function getOrCreateCurrentNode() {
    if (typewriterState.currentNode) {
      return typewriterState.currentNode;
    }

    const seg = typewriterState.segments[typewriterState.segmentIndex];
    if (seg.bold) {
      typewriterState.currentNode = document.createElement('strong');
      typewriterState.currentNode.style.color = seg.color;
      elements.typedTarget.appendChild(typewriterState.currentNode);
    } else {
      typewriterState.currentNode = document.createTextNode('');
      elements.typedTarget.appendChild(typewriterState.currentNode);
    }

    return typewriterState.currentNode;
  }

  function typeNextCharacter() {
    if (typewriterState.segmentIndex >= typewriterState.segments.length) {
      return;
    }

    const seg = typewriterState.segments[typewriterState.segmentIndex];
    const node = getOrCreateCurrentNode();
    const nextChar = seg.text.charAt(typewriterState.charIndex);

    if (seg.bold) {
      node.textContent += nextChar;
    } else {
      node.nodeValue += nextChar;
    }

    typewriterState.charIndex += 1;
    let nextDelay = TYPE_DEFAULT_DELAY_MS;

    if (
      elements.typedTarget.textContent.endsWith('hello!') ||
      nextChar === '\n'
    ) {
      nextDelay = TYPE_EXTENDED_DELAY_MS;
    }

    if (typewriterState.charIndex >= seg.text.length) {
      typewriterState.segmentIndex += 1;
      typewriterState.charIndex = 0;
      typewriterState.currentNode = null;
    }

    setTimeout(typeNextCharacter, nextDelay);
  }

  function revealSocialsThenLinks() {
    if (!elements.socialLinks || !elements.containerLinks) {
      return;
    }

    elements.socialLinks.classList.remove('stagger-prep');
    elements.socialLinks.classList.add('stagger-in');

    const lastIcon = elements.socialLinks.querySelector(
      '.container-social-link:last-child',
    );
    if (!lastIcon) {
      elements.containerLinks.classList.add('links-in');
      return;
    }

    onTransitionEndOnce(
      lastIcon,
      SOCIAL_LAST_ICON_TRANSITION_PROP,
      function () {
        elements.containerLinks.classList.add('links-in');
      },
    );
  }

  let isTransitioningSection = false;

  function whichSectionIsOpen() {
    if (
      elements.aboutContent &&
      elements.aboutContent.classList.contains('is-open')
    )
      return elements.aboutContent;
    if (
      elements.projectsContent &&
      elements.projectsContent.classList.contains('is-open')
    ) {
      return elements.projectsContent;
    }

    return null;
  }

  function openSection(targetContent, targetLink) {
    if (!targetContent || isTransitioningSection) {
      return;
    }

    const currentlyOpen = whichSectionIsOpen();

    if (currentlyOpen === targetContent) {
      moveIndicatorTo(targetLink);
      setActiveLink(targetLink);
      return;
    }

    moveIndicatorTo(targetLink);

    if (!currentlyOpen) {
      targetContent.classList.add('is-open');
      setActiveLink(targetLink);
      return;
    }

    isTransitioningSection = true;

    onTransitionEndOnce(currentlyOpen, 'max-height', function () {
      isTransitioningSection = false;
      targetContent.classList.add('is-open');
      setActiveLink(targetLink);
    });
    currentlyOpen.classList.remove('is-open');
  }

  if (elements.linkAbout) {
    elements.linkAbout.addEventListener('click', function () {
      openSection(elements.aboutContent, elements.linkAbout);
    });
  }

  if (elements.linkProjects) {
    elements.linkProjects.addEventListener('click', function () {
      openSection(elements.projectsContent, elements.linkProjects);
    });
  }

  window.addEventListener('resize', function () {
    var active =
      elements.linkAbout && elements.linkAbout.classList.contains('active')
        ? elements.linkAbout
        : elements.linkProjects &&
            elements.linkProjects.classList.contains('active')
          ? elements.linkProjects
          : null;

    if (active) {
      moveIndicatorTo(active);
    }
  });

  let started = false;
  function startOnce() {
    if (started) {
      return;
    }

    started = true;
    revealSocialsThenLinks();
    typeNextCharacter();
  }

  if (elements.containerProfile) {
    var computed = window.getComputedStyle(elements.containerProfile);
    if (computed.animationName && computed.animationName !== 'none') {
      elements.containerProfile.addEventListener('animationend', startOnce, {
        once: true,
      });
    } else {
      startOnce();
    }
  } else {
    startOnce();
  }
});
