#!/usr/bin/env node

/**
 * Test script to validate Strapi setup and content types
 * Run with: node test-setup.js (after Strapi server is running)
 */

const axios = require('axios').default;

const BASE_URL = 'http://localhost:1337/api';

async function testEndpoints() {
  console.log('🧪 Testing Strapi CMS Setup...\n');

  const endpoints = [
    { name: 'Papers', url: `${BASE_URL}/papers` },
    { name: 'Books', url: `${BASE_URL}/books` },
    { name: 'Sections', url: `${BASE_URL}/sections` },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url);
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.data?.length || 0} items`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`🔐 ${endpoint.name}: Protected (needs authentication) - Setup OK`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }

  // Test admin panel
  try {
    const adminResponse = await axios.get('http://localhost:1337/admin');
    console.log('✅ Admin Panel: Accessible');
  } catch (error) {
    console.log(`❌ Admin Panel: ${error.message}`);
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Access admin panel: http://localhost:1337/admin');
  console.log('2. Create admin user account');
  console.log('3. Create API token for Next.js integration');
  console.log('4. Test content creation through admin panel');
}

if (require.main === module) {
  testEndpoints().catch(console.error);
}

module.exports = { testEndpoints };