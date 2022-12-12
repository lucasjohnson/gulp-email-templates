module.exports = function(plop) {
  plop.setGenerator("email", {
    description: "add email type",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Email name?"
      }
    ],
    actions: [
      {
        type: "add",
        path: "src/emails/{{camelCase name}}.njk",
        templateFile: "plop-templates/email.njk"
      }
    ]
  });
};
