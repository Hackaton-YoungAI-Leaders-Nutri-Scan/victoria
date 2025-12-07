from langchain_google_genai import ChatGoogleGenerativeAI
#from langchain.prompts import PromptTemplate
from langchain_core.prompts import PromptTemplate
from langchain.memory import ConversationSummaryBufferMemory
from langchain.chains import ConversationChain

USER_SESSIONS = {}

## LANGCHAIN CONFIG
prompt_template = PromptTemplate(
    input_variables=["input", "history"],
    template="""
Eres Nutri-Scan, un asistente experto en nutrición clínica y educación alimentaria.
Tu tarea es responder mensajes de WhatsApp de forma:

- Breve
- Clara
- Amigable
- Basada en evidencia
- Sin usar jerga médica innecesaria
- Sin dar diagnósticos médicos

Historial resumido de la conversación:
{history}

Mensaje del usuario:
"{input}"
"""
)
## LANGCHAIN

def get_user_chain(user_id: str) -> ConversationChain:
    """
    Devuelve la cadena (LLM + memoria) asociada a un usuario.
    Si no existe, la crea.
    """
    if user_id not in USER_SESSIONS:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7
        )

        memory = ConversationSummaryBufferMemory(
            llm=llm,
            max_token_limit=512,
            return_messages=True
        )

        chain = ConversationChain(
            llm=llm,
            memory=memory,
            verbose=False
        )

        USER_SESSIONS[user_id] = chain

    return USER_SESSIONS.get(user_id)
