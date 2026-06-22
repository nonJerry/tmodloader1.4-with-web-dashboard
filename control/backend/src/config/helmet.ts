import expressHelmet from "helmet"

const helmetConfig = expressHelmet({
  noSniff: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      frameAncestors: ["'self'"]
    },
  },
})

export default helmetConfig
