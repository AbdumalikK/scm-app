import envs from '../constants/envs';

const ENV = process.env.NODE_ENV || 'development';
const IS_DEV = ENV === envs.development;
const IS_PROD = ENV === envs.production;
const IS_TEST = ENV === envs.test;

export {
	IS_DEV,
	IS_PROD,
	IS_TEST
};

export default ENV;