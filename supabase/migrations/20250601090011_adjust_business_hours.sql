-- Prompt 6.2: ajuste de horários de funcionamento.
--
-- Recursos que NÃO são impressora 3D passam a ter uma janela diária uniforme
-- de 08:00 às 22:45 (antes variava: maioria 08:00-22:00, Oficina 08:00-20:00).
--
-- Impressoras 3D (bambu-lab-a1, flashforge-hunter-dlp, sethi3d) passam a não
-- ter janela diária (horario_abertura/horario_fechamento = null), permitindo
-- reservas que atravessam a madrugada — uma impressão longa não deve ser
-- interrompida pelo fechamento do laboratório. create_reservation já trata
-- null nesses dois campos como "sem checagem de horário de funcionamento"
-- (ver migration 20250601090009: o bloco inteiro do check só roda "if
-- v_resource.horario_abertura is not null and v_resource.horario_fechamento
-- is not null"), então nenhuma mudança de função é necessária — só dados.
-- A duração máxima passa a 1440 minutos (24h) para as impressoras, mantendo
-- um limite (evita reserva "para sempre"), só que agora medido em duração
-- total em vez de encaixar num expediente diário.
update public.resources
set horario_abertura = '08:00',
    horario_fechamento = '22:45'
where tipo <> 'impressora_3d';

update public.resources
set horario_abertura = null,
    horario_fechamento = null,
    duracao_maxima_minutos = 1440
where tipo = 'impressora_3d';
