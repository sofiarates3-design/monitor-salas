import { Router, type Request, type Response } from "express";
import { db } from "../db/sensors";

const router = Router();

// POST /api/atualizar
router.post("/atualizar", (req: Request, res: Response) => {
  const { sala, ruido, presenca } = req.body as {
    sala?: string;
    ruido?: unknown;
    presenca?: unknown;
  };

  if (!sala || typeof sala !== "string") {
    res.status(400).json({ erro: "Campo 'sala' é obrigatório e deve ser uma string." });
    return;
  }

  const salaKey = sala.toLowerCase().replace(/\s+/g, "");

  if (!(salaKey in db)) {
    res.status(404).json({ erro: `Sala '${sala}' não encontrada no banco de dados.` });
    return;
  }

  if (ruido !== undefined) {
    const ruidoNum = Number(ruido);
    if (Number.isNaN(ruidoNum)) {
      res.status(400).json({ erro: "Campo 'ruido' deve ser um número." });
      return;
    }
    db[salaKey]!.ruido = ruidoNum;
  }

  if (presenca !== undefined) {
    db[salaKey]!.presenca = Boolean(presenca);
  }

  db[salaKey]!.ultimaAtualizacao = new Date().toISOString();

  req.log.info({ sala: salaKey }, "Sensor data updated");
  res.json({ mensagem: "Dados atualizados com sucesso.", sala: salaKey, dados: db[salaKey] });
});

// GET /api/status-geral
router.get("/status-geral", (_req: Request, res: Response) => {
  res.json(db);
});

export default router;
