# Analysis of "A Survey and Guideline on Privacy Enhancing Technologies for Collaborative Machine Learning"

## Motivations
- Growing need to use sensitive data for ML/AI without exposing raw data
- Collaborative ML approaches help use distributed data while preserving privacy
- Existing solutions don't fully address privacy concerns in collaborative ML
- Need for guidelines on selecting appropriate privacy-enhancing technologies (PETs)

## Objectives
1. Analyze collaborative ML techniques (FL, SL, DecL) from privacy perspective
2. Provide comprehensive threat model and security/privacy considerations
3. Review existing PET applications in collaborative ML
4. Propose methodology for PET selection based on requirements/constraints

## Notations
- FL: Federated Learning
- SL: Split Learning  
- DecL: Decentralized Learning
- PET: Privacy Enhancing Technology
- SMPC: Secure Multi-Party Computation
- HE: Homomorphic Encryption
- DP: Differential Privacy
- CC: Confidential Computing
- TEE: Trusted Execution Environment

## Assumptions
- Data is distributed among different entities
- Parties want to collaborate without sharing raw data
- Server may be honest-but-curious or malicious
- Clients may drop out during training
- Non-IID data distribution among clients

## Federated Learning Processes
1. Server initializes global model
2. Server sends model to clients
3. Clients train locally on their data
4. Clients send model updates to server 
5. Server aggregates updates to improve global model
6. Repeat until convergence

## Techniques with Math Formulas

### Differential Privacy
Adds noise to gradients or outputs:
```
θ_t+1 = θ_t - η(∇L(θ_t) + N(0, σ²))
```
where σ controls noise level.

### Homomorphic Encryption
Allows computation on encrypted data:
```
Enc(x) ⊗ Enc(y) = Enc(x ∘ y)
```
where ⊗ is homomorphic operation.

### Secure Multi-Party Computation
Securely computes function f(x₁,...,xₙ) without revealing inputs.

## Weaknesses
- Model updates may leak information about training data
- Communication overhead for privacy techniques
- Accuracy vs privacy trade-offs
- Vulnerable to poisoning attacks
- Difficult to verify computations
- Device dropouts affect convergence
