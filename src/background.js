'use strict';

const AUTOSAVE_ALARM_NAME = 'ai_chat_exporter_gemini_autosave';
const AUTOSAVE_ALARM_PERIOD_MINUTES = 1;
const GEMINI_TAB_URL_PATTERN = '*://gemini.google.com/*';

function createAutosaveAlarm() {
  chrome.alarms.create(AUTOSAVE_ALARM_NAME, {
    periodInMinutes: AUTOSAVE_ALARM_PERIOD_MINUTES
  });
}

function requestAutosaveRunsForGeminiTabs(trigger) {
  chrome.tabs.query({ url: [GEMINI_TAB_URL_PATTERN] }, (tabs) => {
    if (chrome.runtime.lastError || !Array.isArray(tabs)) {
      return;
    }

    tabs.forEach((tab) => {
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, {
        type: 'RUN_AUTOSAVE_EXPORT',
        trigger
      }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
}

function toDataUrl(markdown) {
  const encodedMarkdown = encodeURIComponent(markdown);
  return `data:text/markdown;charset=utf-8,${encodedMarkdown}`;
}

chrome.runtime.onInstalled.addListener(() => {
  createAutosaveAlarm();
  requestAutosaveRunsForGeminiTabs('installed');
});

chrome.runtime.onStartup.addListener(() => {
  createAutosaveAlarm();
  requestAutosaveRunsForGeminiTabs('startup');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm?.name !== AUTOSAVE_ALARM_NAME) return;
  requestAutosaveRunsForGeminiTabs('alarm');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'AUTOSAVE_DOWNLOAD_MARKDOWN') {
    return false;
  }

  const markdown = typeof message.markdown === 'string' ? message.markdown : '';
  const filenameBase = typeof message.filenameBase === 'string' ? message.filenameBase : '';

  if (!markdown || !filenameBase) {
    sendResponse({ ok: false, error: 'Missing markdown or filename.' });
    return false;
  }

  const downloadOptions = {
    url: toDataUrl(markdown),
    filename: `${filenameBase}.md`,
    saveAs: false
  };

  chrome.downloads.download(downloadOptions, (downloadId) => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    sendResponse({ ok: true, downloadId });
  });

  return true;
});
