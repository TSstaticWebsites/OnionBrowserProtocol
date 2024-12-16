from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from typing import List
import random
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import serialization

from .models import Node, NodeList, OnionRequest, OnionPackage
from .services import get_available_nodes, forward_onion_package
from .encryption import encryption_service

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/nodes", response_model=NodeList)
async def get_nodes():
    try:
        nodes = await get_available_nodes()
        for node in nodes.nodes:
            if node.id not in encryption_service._public_keys:
                node.public_key = encryption_service.generate_key_pair(node.id)
        return nodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/relay", response_model=str)
async def relay_package(request: OnionRequest):
    try:
        if not request.packages or len(request.packages) != 3:
            raise HTTPException(
                status_code=400,
                detail="Invalid package structure. Must contain exactly 3 layers."
            )
        try:
            first_package = request.packages[0]
            node_id = request.entry_node
            decrypted = encryption_service.decrypt_layer(node_id, first_package.data)
            first_package.data = encryption_service.encrypt_layer(node_id, decrypted)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid encryption: {str(e)}"
            )
        response = await forward_onion_package(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/select-nodes", response_model=List[Node])
async def select_circuit_nodes():
    try:
        nodes = await get_available_nodes()
        entry_nodes = [n for n in nodes.nodes if n.role == "entry"]
        middle_nodes = [n for n in nodes.nodes if n.role == "middle"]
        exit_nodes = [n for n in nodes.nodes if n.role == "exit"]

        if not (entry_nodes and middle_nodes and exit_nodes):
            raise HTTPException(
                status_code=400,
                detail="Insufficient nodes available for circuit creation"
            )

        selected_nodes = [
            random.choice(entry_nodes),
            random.choice(middle_nodes),
            random.choice(exit_nodes)
        ]

        return selected_nodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
