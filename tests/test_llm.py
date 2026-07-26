import time
from utils.llm_client import ask_llm


time.sleep(2)
result = ask_llm("Say hello and introduce yourself in one sentence.")
print(result)