import test from 'ava';
import agent from 'supertest-koa-agent';

import Koa from 'koa';
import jwtService from '../services/jwt-service';
import createApp from '../server';

const app = agent(createApp());

test('User can signup', async t => {
    const res = await app.post('/menu/auth/signup').send({
        "phone": "+998909097689"
    });
    t.is(res.status, 400);
});

test('User can successfully login', async t => {
    const res = await app.post('/menu/auth/signin').send({
        "code": "8888"
    });
    t.is(res.status, 200);
    t.truthy(typeof res.body.message.token === 'string');
    t.truthy(typeof res.body.message.refreshToken === 'string');
});

test('User gets 400 on invalid credentials', async t => {
    const res = await app.post('/menu/auth/signin').send({
        "code": "7777"
    });
    t.is(res.status, 403);
});

test('User receives 401 on expired token', async t => {
    const expiredToken = jwtService.genToken({ email: 'alishersulimov@gmail.com' }, { expiresIn: '1ms' });
    const res = await app
        .post('/menu/auth/signin')
        .set('Authorization', `${expiredToken}`);
    t.is(res.status, 401);
});

test('User can get new access token using refresh token', async t => {
    const res = await app.post('/refresh').send({
        refreshToken: '8fe774ae-558c-4de6-8eb1-e5165d18e88f5c37230168339010b6136965'
    });
    t.is(res.status, 200);
    t.truthy(typeof res.body.token === 'string');
    t.truthy(typeof res.body.refreshToken === 'string');
});

test('User can use refresh token only once', async t => {
    const firstResponse = await app.post('/refresh').send({
        refreshToken: 'a242f67c-2d08-45f7-a402-ddc01b11f6155c37230168339010b6136965'
    });
    t.is(firstResponse.status, 200);
    t.truthy(typeof firstResponse.body.token === 'string');
    t.truthy(typeof firstResponse.body.refreshToken === 'string');

    const secondResponse = await app.post('/refresh').send({
        refreshToken: 'a242f67c-2d08-45f7-a402-ddc01b11f6155c37230168339010b6136965'
    });
    t.is(secondResponse.status, 404);
});

test('Multiple refresh tokens are valid', async t => {
    const firstLoginResponse = await app.post('/menu/auth/signin').send({
        "code": "8888"
    });

    const secondLoginResponse = await app.post('/menu/auth/signin').send({
        "code": "8888"
    });

    t.is(firstLoginResponse.status, 200);
    t.is(secondLoginResponse.status, 200);

    const firstRefreshResponse = await app.post('/refresh').send({
        refreshToken: `${firstLoginResponse.body.refreshToken}5c37230168339010b6136965`
    });

    t.is(firstRefreshResponse.status, 200);
    t.truthy(typeof firstRefreshResponse.body.token === 'string');
    t.truthy(typeof firstRefreshResponse.body.refreshToken === 'string');

    const secondRefreshResponse = await app.post('/refresh').send({
        refreshToken: `${secondLoginResponse.body.refreshToken}5c37230168339010b6136965`
    });

    t.is(secondRefreshResponse.status, 200);
    t.truthy(typeof secondRefreshResponse.body.token === 'string');
    t.truthy(typeof secondRefreshResponse.body.refreshToken === 'string');
});

test('Refresh tokens become invalid on logout', async t => {
    const logoutRes = await app
        .post('/logout')
        .set('Authorization', 
        `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaXNoZXJzdWxpbW92QGdtYWlsLmNvbSIsImlhdCI6MTU0NzEyNzAyOH0.jXFgqb8601VboxdvirK4O4GDKsnGGHJIKPDY_jC4reQ`);
    t.is(logoutRes.status, 200);

    const res = await app.post('/refresh').send({
        refreshToken: 'd7d8d2fa-0576-4198-8448-0289b013d3de5c37230168339010b6136965'
    });
    t.is(res.status, 404);
});


