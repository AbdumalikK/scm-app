import Router from 'koa-router';
import authController from './controllers/auth-controller';
import accessUser from '../../handlers/accessUser';
import checkUser from '../../handlers/checkUser';
import check from './handlers/check';

const passport = require('koa-passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

import { 
	GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
	FACEBOOK_APP_ID, FACEBOOK_APP_SECRET
} from '../../config';


const router = new Router();

router.use(passport.initialize())
router.use(passport.session())

// google
passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/auth/google/callback'
	}, (accessToken, refreshToken, profile, done) => {
		console.log('profile', profile)

		return done(null, profile);
	}
));

// facebook
passport.use(new FacebookStrategy({
	clientID: FACEBOOK_APP_ID,
	clientSecret: FACEBOOK_APP_SECRET,
	callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }, (accessToken, refreshToken, profile, done) => {
	console.log('profile', profile)

	return done(null, profile);
  }));


passport.serializeUser(function(user, done) {
	done(null, user);
});
	
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

router
	.post('/auth/signup', check(), authController.signup)
	.post('/auth/signup/confirm', check(), authController.signupConfirm)
	.post('/auth/signin', check(), authController.signin)
	.post('/auth/signin/confirm', check(), authController.signinConfirm)


	// google auth
	.get('/auth/google', check(), passport.authenticate('google', { scope: ['profile', 'email'] }))
	.get('/auth/google/callback', check(), 
		passport.authenticate('google', { successRedirect: '/', failureRedirect: '/auth/failure' })
	)

	.get('/protected', async (ctx, next) => {
		if (ctx.isAuthenticated()) {
			await next();
		} else {
			ctx.redirect('/login');
		}
	}, async (ctx) => {
		ctx.body = 'Private page!';
	})

	// facebook auth
	.get('/auth/facebook', check(), passport.authenticate('facebook'))
	.get('/auth/facebook/callback', check(), passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth/failure' }))

	.get('/prof', async (ctx) => {
		if (ctx.isAuthenticated()) {
			ctx.body = `Hi, ${ctx.state.user.displayName}!`;
		} else {
			ctx.redirect('/login');
		}
	})

	
	.get('/auth/failure', check(), async (ctx) => {
		ctx.status = 500
		return ctx.body = {
			success: false,
			message: 'Somehting went wrong'
		}
	})

	.post('/auth/forgot-password', check(), authController.forgotPassword)
	.post('/auth/forgot-password/confirm', check(), authController.forgotPasswordConfirm)
	.post('/auth/reset-password', check(), authController.resetPassword)
	.get('/logout', async (ctx) => {
		ctx.logout();
		ctx.redirect('/');
	})

export default router.routes();