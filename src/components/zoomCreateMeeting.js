// zoomCreateMeeting.js (Node.js 環境用)

import fetch from 'node-fetch';

const ZOOM_API_KEY = 'YOUR_ZOOM_API_KEY';
const ZOOM_API_SECRET = 'YOUR_ZOOM_API_SECRET';
const ZOOM_USER_ID = 'your_email@example.com'; 
const jwtToken = 'YOUR_ZOOM_JWT_TOKEN';

export async function createZoomMeeting(topic = "DisCuss セッション", startTime = new Date()) {
  const response = await fetch(`https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime.toISOString(),
      duration: 60,
      timezone: 'Asia/Tokyo',
      settings: {
        join_before_host: true,
        approval_type: 0,
        registration_type: 1
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Zoom API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    join_url: data.join_url,
    meeting_id: data.id,
    password: data.password
  };
}
