import http from 'k6/http'
import encoding from 'k6/encoding'
import { check } from 'k6'

const API_URL = __ENV.API_URL || 'https://api.demoblaze.com'
const USERNAME = 'testUserK6'
const PASSWORD = __ENV.TEST_ACCOUNT_PASSWORD
const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } }

export const options = {
  scenarios: {
    login: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE) || 2,
      timeUnit: '1s',
      duration: __ENV.DURATION || '10s',
      preAllocatedVUs: Number(__ENV.PRE_ALLOCATED_VUS) || 2,
      maxVUs: Number(__ENV.MAX_VUS) || 10,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1000'],
  },
}

function postJson(path, body) {
  return http.post(`${API_URL}${path}`, JSON.stringify(body), JSON_HEADERS)
}

function hasAuthToken(res) {
  try {
    const body = res.json()
    return typeof body === 'string' && body.startsWith('Auth_token: ')
  } catch {
    return false
  }
}

export function setup() {
  const credentials = { username: USERNAME, password: encoding.b64encode(PASSWORD) }
  postJson('/signup', credentials)
  return { credentials }
}

export default function ({ credentials }) {
  const loginRes = postJson('/login', credentials)
  check(loginRes, {
    'login status is 200': (res) => res.status === 200,
    'login returns a token': hasAuthToken,
  })
}
