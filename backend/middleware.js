
export const validateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.VITE_ADMIN_TOKEN || 'ADMIN_TOKEN_V3';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ error: 'Não autorizado. Token de administrador inválido ou ausente.' });
    }
    next();
};
