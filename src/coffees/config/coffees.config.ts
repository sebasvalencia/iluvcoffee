import { registerAs } from '@nestjs/config';

/**
 * registerAs : register a namespace conf
 object under the key past as our fist argument
  */

export default registerAs('coffees', () => ({
  // 👈
  foo: 'bar', // 👈
}));
