import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    vus: 10,
    duration: '30s',
};

let rateLimitReached = false;

export default function () {
    if (rateLimitReached) {
        sleep(0.5); // Slow down if rate limit is reached
    }

    // Setting request parameters, including the Authorization header and the option to ignore TLS certificate validation
    const params = {
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjAwMDEifQ.eyJuYW1lIjoiUXVvdGF0aW9uIFN5c3RlbSIsInN1YiI6InF1b3RlcyIsImlzcyI6Ik15IEFQSSBHYXRld2F5In0.ggVOHYnVFB8GVPE-VOIo3jD71gTkLffAY0hQOGXPL2I" 
            },
        insecureSkipTLSVerify: true
    };

    let res = http.get('https://jobs.local/get-job', params);

    if (res.status === 429) {
        rateLimitReached = true;
        sleep(1); // Increase sleep time or implement other logic
    }

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
