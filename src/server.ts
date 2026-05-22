import express, { type Request, type Response } from 'express';
import cors from 'cors';
import db from './database/connection.js';

const app = express();
app.use(cors());
app.use(express.json());


app.get('/banco', async (req: Request, res: Response) => {
    try {
        const [clientes] = await db.query('SELECT * FROM clientes');
        return res.json({ 
            mensagem: "Conexão com o MySQL feita com sucesso!",
            dados: clientes 
        });
    } catch (erro) {
        console.error("Falha no banco:", erro);
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

app.post('/contratos', async (req: Request, res: Response) => {
    try {
        const { cliente_id, tipo_evento, data_evento, valor_total } = req.body;

        if (!cliente_id || !tipo_evento || !data_evento || !valor_total) {
            return res.status(400).json({ erro: "Todos os campos de contrato são obrigatórios"})
        }

        const comandoSQL = 'INSERT INTO contratos (cliente_id, tipo_evento, data_evento, valor_total) VALUES (?, ?, ?, ?)';

        const dados = [cliente_id, tipo_evento, data_evento, valor_total]; 
    
        const [resultado] = await db.query(comandoSQL, dados);

        return res.status(201).json({
            mensagem: 'Contrato gerado com sucesso',
            resultado
        });
    } catch (erro) {
        console.error ('Erro ao gerar contratos', erro);
        return res.status(500).json({erro: 'Falha ao gerar contato no banco'});
    }
});

app.post('/parcelas', async (req: Request, res: Response) => {
    try {
        const { contrato_id, valor_parcela, data_vencimento } = req.body;

        if (!contrato_id || !valor_parcela || !data_vencimento) {

            return res.status(400).json({erro: "ID do contrato, valor e data de vencimento são obrigatórios!"})
        }

        const comandoSQL = 'INSERT INTO parcelas (contrato_id, valor_parcela, data_vencimento) VALUES (?,?,?)';
        const valores = [contrato_id, valor_parcela, data_vencimento];

        const [resultado] = await db.query(comandoSQL, valores);

        return res.status(201).json({
            mensagem: "Parcela registrada com sucesso!",
            resultado
        });
    } catch (erro) {
        console.error("Erro ao gerar parcela", erro);
        return res.status(500).json({ erro: "Falha ao registrar a parcela no banco"});
    }

});

app.get('/clientes/:id/relatorio', async (req: Request, res: Response) => {
    try {
        const id_do_cliente = req.params.id;

        const comandosSQL = `
        
        SELECT 
            c.nome_completo,
            c.cpf,
            ct.tipo_evento,
            ct.data_evento,
            ct.valor_total,
            p.valor_parcela,
            p.data_vencimento,
            p.foi_pago
        FROM clientes c 
        INNER JOIN contratos ct ON c.id = ct.cliente_id
        INNER JOIN parcelas p ON ct.id = p.contrato_id
        WHERE c.id = ?    
        `;

        
        const [resultado] = await db.query(comandosSQL, [id_do_cliente]);

        if ((resultado as any[]).length === 0) {
            return res.status(404).json({
                mensagem:"Nenhum relatório encontrado. Verifique se o cliente possui contratos e parcelas geradas."
            });
        }

        return res.status(200).json ({
            mensagem:"Relatório gerado com sucesso!",
            relatorio: resultado
        });
    } catch (erro) {
        console.error("Erro ao gerar relatório:", erro);
        return res.status(500).json({ erro: "Falha interna do servidor ao cruzar os dados"})
    }
});

//rota PATCH para dar baixa em uma parcela

app.patch('/parcelas/:id/pagar', async (req: Request, res: Response) => {
    try {
        const id_da_parcela = req.params.id;

        // 2. O comando SQL para atualizar apenas a coluna "foi_pago"

        const comandoSQL = "UPDATE parcelas SET foi_pago = TRUE WHERE id = ?";

        const [resultado] = await db.query (comandoSQL, [id_da_parcela]);

        //o banco encontrou a parcela para atualizar?

        if ((resultado as any).affectedRows === 0) {
            return res.status(404).json({erro: "Parcela não encontrada no sistema!"});
        }
        return res.status(200).json({
            mensagem: "Pagamento realizado com sucesso!"
        });
    } catch (erro) {
        console.error ("Erro ao registrar pagamento:", erro);
        return res.status(500).json({erro: "Falha interna ao atualizar parcela."})
    }
});

app.delete ('/parcelas/:id', async (req: Request, res: Response) => {
    try {
        const id_da_parcela = req.params.id;

        const comandoSQL = 'DELETE from parcelas WHERE id = ?';
        const [resultado] = await db.query (comandoSQL, [id_da_parcela]);

    // o banco encontrou e apagou a linha?
    
    if ((resultado as any).affectedRows === 0) {
        return res.status(404).json({erro: "Parcela não encontrada para exclusão!"});
    }

    return res.status(200).json({
        mensagem: "Parcela excluida com sucesso do Sistema"
    });

    } catch (erro) {
        console.error("Erro ao excluir parcela:", erro);
        return res.status(500).json({erro: "Falha interna ao tentar excluir parcela."});
    }
});

const PORTA = 3333;
app.listen(PORTA, () => {
    console.log(`Servidor rodando perfeitamente na porta ${PORTA}`);
});
