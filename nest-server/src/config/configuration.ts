function required(
  key: string,
  defaultValue?: undefined | string | number,
): string | number {
  const value: undefined | string | number = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`config ${key} is  undefined`);
  }
  if (typeof value === 'number') {
    return value;
  }
  const num = Number(value);
  if (typeof value === 'string') {
    if (Number.isNaN(num)) {
      return value;
    }
  }
  return num;
}

export function getConfig() {
  const config = {
    app: {
      env: required('APP_ENV') as string,
      port: required('APP_PORT') as string,
      logLevel: required('APP_LOG_LEVEL') as string,
    },
    typeorm: {
      type: 'mysql' as const,
      host: required('TYPEORM_HOST') as string,
      port: required('TYPEORM_PORT') as number,
      username: required('TYPEORM_USERNAME') as string,
      password: required('TYPEORM_PASSWORD') as string,
      database: required('TYPEORM_DATABASE') as string,
      logging: JSON.parse(required('TYPEORM_LOGGING') as string) as boolean,
    },
  };
  return config;
}
