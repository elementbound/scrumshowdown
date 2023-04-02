import { Router } from 'express'
const profileRouter = Router()

profileRouter.get('/', (req, res, next) => {
  res.render('profile')
})

export default profileRouter
