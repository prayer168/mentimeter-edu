import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    res.status(401).json({ error: '未登入' })
    return
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    res.status(401).json({ error: '無效的登入憑證，請重新登入' })
    return
  }

  req.user = user
  next()
}
