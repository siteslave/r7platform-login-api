# Login API

Environments: 

```
PGRST_ENDPOINT=http://localhost:3000
PGRST_TOKEN=xxx.xxx.xxx

SECRET_KEY=xxxxxx

DB_DEBUG=Y

NODE_ENV=development
```

# Run

```
npm start
```

# Build

```
npm run build
```

# Grant database permission

```sql
create role authenticator noinherit login password 'xxxxxx';

create role myname nologin;
grant myname to authenticator;
grant usage on schema public to myname;
grant all on public.users to myname;
```

# Create JWT

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1674217011,
  "role": "myname"
}
```
