from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class NodeRole(str, Enum):
    ENTRY = "entry"
    MIDDLE = "middle"
    EXIT = "exit"

class Node(BaseModel):
    id: str
    public_key: str
    role: NodeRole
    address: str

class Circuit(BaseModel):
    entry_node: Node
    middle_node: Node
    exit_node: Node

class OnionPackage(BaseModel):
    data: str  # Base64 encoded encrypted data
    next_hop: str

class OnionRequest(BaseModel):
    packages: List[OnionPackage]
    entry_node: str  # Address of entry node

class NodeList(BaseModel):
    nodes: List[Node]
