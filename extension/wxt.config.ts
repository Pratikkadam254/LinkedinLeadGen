import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'LeadFlow AI - Sales Navigator Extractor',
    description: 'Extract leads from LinkedIn Sales Navigator with one click',
    permissions: ['activeTab', 'storage', 'alarms', 'cookies'],
    host_permissions: ['https://www.linkedin.com/*'],
    // ANTI-DETECTION: No web_accessible_resources to prevent LinkedIn probing
    web_accessible_resources: [],
  },
  runner: {
    startUrls: ['https://www.linkedin.com/sales/'],
  },
});
