module.exports = {
    apps : [
      {
        name: "api-v1",
        script: 'yarn start',
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
          "PORT": 3000,
          "NODE_ENV": "development"
        }
      }
    ]
  }