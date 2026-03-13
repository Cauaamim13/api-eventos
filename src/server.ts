import express, { type Request, type Response } from 'express';

const app = express();
app.use(express.json());

app.get('/teste', (req: Request, res: Response) => {
    return res.json({ 
        mensagem: "Fala! Nossa API está no ar!",
        status: "Sucesso"
    });
});

const PORTA = 3333;
app.listen(PORTA, () => {
    console.log(`Servidor rodando perfeitamente na porta ${PORTA}`);
});