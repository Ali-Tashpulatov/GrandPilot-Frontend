from pathlib import Path
import hashlib,json
root=Path('/Users/ali/Downloads/hack-ce32ffa1-lsj-main')
baseline=json.loads(Path('/Users/ali/Downloads/support-copilot/integration/backend-baseline.json').read_text())
for name,digest in baseline.items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest, f'Concurrent change detected: {name}; refusing to overwrite'
p=root/'src/verdict_engine.py';s=p.read_text();needle='    server_lang = (ticket.get("server_lang") or "").lower().strip()';s=s.replace(needle,'    if lang in ("kk", "ru", "uz", "en"):\n        return lang\n'+needle,1);p.write_text(s)
p=root/'src/api.py';s=p.read_text().replace('from pydantic import BaseModel','from pydantic import BaseModel, Field, model_validator').replace('from typing import Optional','from typing import Optional, Literal');s=s.replace('    kind: str = "complaint"','    kind: Literal["complaint", "report"] = "complaint"').replace('    lang: str = "ru"','    lang: Literal["kk", "ru", "uz", "en"] = "ru"').replace('    images_count: int = 0','    images_count: int = Field(default=0, ge=0)').replace('    messages: list[TicketMessage] = []','''    messages: list[TicketMessage] = Field(default_factory=list)

    @model_validator(mode="after")
    def require_player_text(self):
        if not any(m.role == "player" and m.text.strip() for m in self.messages):
            raise ValueError("At least one non-empty player message is required")
        return self
''');s=s.replace('    result = process_ticket(ticket_dict)','''    result = process_ticket(ticket_dict)
    # Classification is advisory; no evidence review or enforcement happens here.
    # Keep the contract while preventing generated claims of confirmed sanctions.
    if result["punishment_suggestion"] or result["verdict"] in (
        "approved", "already_punished", "appeal_approved", "appeal_rejected"
    ) or (ticket.kind == "complaint" and result["needs_human"]):
        drafts = {
            "en": "Thank you for your report. An operator must review the evidence before confirming a violation or deciding any action. This automated analysis does not confirm a punishment or that any action has been taken.",
            "ru": "Спасибо за обращение. Оператор должен проверить доказательства, прежде чем подтвердить нарушение или принять решение. Автоматический анализ не подтверждает наказание или применение каких-либо мер.",
            "kk": "Өтінішіңіз үшін рақмет. Бұзушылықты растау немесе шара қолдану туралы шешім қабылдау үшін оператор дәлелдерді тексеруі керек. Автоматты талдау жаза тағайындалғанын немесе шара қолданылғанын растамайды.",
            "uz": "Murojaatingiz uchun rahmat. Qoidabuzarlikni tasdiqlash yoki chora belgilashdan oldin operator dalillarni tekshirishi kerak. Avtomatik tahlil jazo yoki biror chora qo‘llanganini tasdiqlamaydi.",
        }
        result.update(verdict="escalated", needs_human=True,
                      punishment_suggestion=None, draft=drafts[ticket.lang])
''');p.write_text(s)
print('Updated src/api.py and src/verdict_engine.py; original hashes matched.')
