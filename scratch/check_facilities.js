const axios = require('axios');

async function checkFacilities() {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/facilities');
    console.log('Total facilities:', response.data.length);
    response.data.forEach(f => {
      console.log(`- ${f.name} (ID: ${f.id}, Type: ${f.type}, Status: ${f.status})`);
    });
  } catch (error) {
    console.error('Error fetching facilities:', error.message);
  }
}

checkFacilities();
