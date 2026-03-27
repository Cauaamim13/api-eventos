import express, { type Request, type Response } from 'express';
import db from './database/connection.js';

const app = express();
app.use(express.json());


app.get('/banco', async (req: Request, res: Response) => {
    try {
        const [clientes] = await db.query('SELECT * FROM clientes');
        return res.json({ 
            mensagem: "Conexão com o MySQL feita com sucesso!",
            dados: clientes 
        });
    } catch (erro) {
        console.error("Deu ruim no banco:", erro);
        return res.status(500).json({ erro: "Falha na conexão com o banco" });
    }
});


app.post('/clientes', async(req:Request, res: Response) =>
{
    try {
        const { nome_completo, cpf, telefone, email } = req.body;
  

    if (!nome_completo) {
        return res.status(400).json ({erro: "O nome completo é obrigatório!"});
    }

    const comandosSQL = 'INSERT into clientes (nome_completo, cpf, telefone, email) VALUES (?,?,?,?)';
    const dados = [nome_completo, cpf, telefone, email];


    const [resultado] = await db.query(comandosSQL, dados);

    return res.status(201).json({
        mensagem: "Cliente cadastrado com sucesso!",
        resultado
    });

} catch (erro) {
    console.error ("Erro ao cadastrar o cliente: ", erro);
    return res.status(500).json({erro: "Falha no servidor"});
}
});

const PORTA = 3333;
app.listen(PORTA, () => {
    console.log(`Servidor rodando perfeitamente na porta ${PORTA}`);
});