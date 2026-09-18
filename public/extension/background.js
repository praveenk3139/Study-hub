// Background service worker for StudyFlow AI Focus Shield extension
const BLOCKED_DOMAINS = [
  'instagram.com',
  'facebook.com',
  'x.com',
  'twitter.com',
  'snapchat.com',
  'reddit.com',
  'tiktok.com',
  'twitch.tv',
  'netflix.com'
];

function isDomainBlocked(url) {
  if (!url) return false;
  return BLOCKED_DOMAINS.some(domain => url.toLowerCase().includes(domain));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && isDomainBlocked(changeInfo.url)) {
    chrome.storage.local.get(['focusActive'], (result) => {
      const active = result.focusActive !== false; // Default active: true
      if (active) {
        chrome.tabs.update(tabId, {
          url: 'http://localhost:3000/#focus-shield?blocked=' + encodeURIComponent(changeInfo.url)
        });
      }
    });
  }
});

if (chrome.webNavigation && chrome.webNavigation.onBeforeNavigate) {
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0 && isDomainBlocked(details.url)) {
      chrome.storage.local.get(['focusActive'], (result) => {
        const active = result.focusActive !== false;
        if (active) {
          chrome.tabs.update(details.tabId, {
            url: 'http://localhost:3000/#focus-shield?blocked=' + encodeURIComponent(details.url)
          });
        }
      });
    }
  });
}
