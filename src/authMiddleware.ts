// src/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface pour typer la requête Express avec les infos de l'utilisateur
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'commercial' | 'gestionnaire' | 'technicien';
  };
}

// 1. Middleware qui vérifie si l'utilisateur est connecté
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé : Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'votre_cle_secrete', (err, user: any) => {
    if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
    req.user = user;
    next();
  });
};

// 2. Middleware qui vérifie si le rôle est autorisé pour la route
export const requireRole = (allowedRoles: Array<'admin' | 'commercial' | 'gestionnaire' | 'technicien'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès interdit : le rôle '${req.user?.role}' n'a pas la permission requise.` 
      });
    }
    next();
  };
};