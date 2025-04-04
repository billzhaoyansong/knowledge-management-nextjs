# Analysis of "Coalition Formation for Heterogeneous Federated Learning Enabled Channel Estimation in RIS-assisted Cell-free MIMO"

## Motivations
1. **High-dimensional channel estimation challenge**: Conventional centralized DL methods require data aggregation from all users, leading to excessive communication overhead and privacy concerns.
2. **Computational burden**: Large local learning models impose heavy demands on end-user devices with limited capabilities.
3. **Heterogeneous user conditions**: Channel attenuation varies significantly among geographically dispersed users in multi-user RIS-MIMO networks.

## Objectives
1. Develop a coalition-formation-guided FL framework for efficient channel estimation.
2. Reduce local model size and computational costs for end users.
3. Improve channel estimation accuracy while maintaining data privacy.
4. Accelerate DRL-FL convergence through transfer learning.

## Notations

### System Parameters
- B: Number of BSs
- K: Number of UEs  
- N_t: Number of BS antennas
- N: Number of RIS elements
- Φ: RIS phase shift matrix

### Channel Parameters
- G_b: Channel matrix between BS b and RIS
- v^H_k: Channel matrix between RIS and UE k  
- h_k: Cascaded channel between BSs and UE k
- y_k: Received signal by UE k
- F_k: Beamforming vector from BSs to UE k

### UE-related Notations
- D_k: Local dataset size for UE k
- L_m: Distance of UE m to BS
- P_m: Received signal power for UE m
- Q_k: Individual Q-value for UE k in Qmix

### Coalition-related Notations  
- S_j: Coalition j
- |S_j|: Number of UEs in coalition S_j
- U(S_j): Utility function for coalition S_j
- e_{j,p}: Error metric for parameter p in coalition j

### Central Node Notations
- W_g: Global model in HFL
- W_f: Distilled model in HFL  
- ω_t: Global model parameters at iteration t
- η_t: Learning rate at iteration t

### FL-related Notations
- α_m: Weight for UE m's contribution in FL
- α'_m: Base weight for UE m (distance-based)
- α''_m: Final weight for UE m (RSRP+Dis)  
- M̂_t: Set of active UEs in round t
- r_t: Weighted aggregate of local gradients

### DRL-related Notations
- Q_{tot}: Joint action-value in Qmix
- f_{mix}: Qmix mixing network function  
- A: Base utility constant in coalition game
- P: Total number of error metrics

## Assumptions
1. Channels between BSs and UEs are completely obstructed (focus on cascaded channels).
2. RIS phase shift matrix Φ and beamforming vector F_k are predetermined and known.
3. Users with similar distances to BS and comparable received signal power experience similar channel fading.
4. UEs have varying computational capabilities (heterogeneous devices).

## Main Workflow
1. **Initialization**:
   - [BSs] Configure RIS phase shifts and beamforming vectors (F_k)
   - [BSs] Transmit pilot signals for channel estimation
   - [UEs] Collect local channel data from BS transmissions
   - [System] Initialize DNN models and FL parameters

2. **Iterative FL Process** (repeated each epoch):
   a) **Dynamic Coalition Update**: (Each UE independently optimizes its coalition membership via Qmix DRL based on channel estimation performance, forming self-organizing groups that balance accuracy and efficiency)
      - [UEs] Evaluate current coalition performance via NMSE:
        ```math
        \text{NMSE}_{S_j} = \frac{1}{|S_j|}\sum_{k\in S_j} \frac{\|\hat{h}_k - h_k\|^2}{\|h_k\|^2}
        ```
        Where:
        - $S_j$: Current coalition being evaluated
        - $|S_j|$: Number of UEs in coalition $S_j$
        - $\hat{h}_k$: Estimated channel for UE $k$
        - $h_k$: True channel for UE $k$
        
      - [QMix distributed across UEs] Updates groupings using utility:
        ```math
        U(S_j) = A - \sum_{p=1}^P e_{j,p}
        ```
        Where:
        - $A$: Base utility constant
        - $e_{j,p}$: Error metric for parameter $p$ in coalition $j$
        - $P$: Total number of error metrics
        
        * Considers channel correlation changes
        * Accounts for device capability variations
        * Optimizes for estimation accuracy and efficiency
        
      - [Each UE] Independently decides to join/leave coalitions via Qmix:
        ```math
        Q_{tot} = f_{mix}(Q_1,...,Q_K)
        ```
        Where:
        - $Q_{tot}$: Joint action-value
        - $Q_k$: Individual Q-value for UE $k$
        - $f_{mix}$: Qmix mixing network function
   b) **Per-Iteration Transfer Learning**:
      - [Central Nodes] Re-initialize models using RSRP+Dis weights:
        ```math
        \alpha''_m = \begin{cases}
        (1 - \frac{|P_m - P_{center}|}{2\Delta})\alpha'_m, & \text{if } P_{center} - \Delta < P_m < P_{center} + \Delta \\
        0, & \text{otherwise}
        \end{cases}
        ```
        Where:
        - $\alpha''_m$: Final weight for UE $m$
        - $P_m$: Received signal power for UE $m$
        - $P_{center}$: Center of power range
        - $\Delta$: Power range width
        - $\alpha'_m = \max(1 - L_m/L, 0)$: Base weight
        - $L_m$: Distance of UE $m$ to BS
        - $L$: Maximum considered distance
   c) **Local Training**: Within each coalition:
      - [Each UE] Trains local DNNs to minimize:
        ```math
        \min_\omega L(\omega) = \frac{1}{D_k}\sum_{D_k} \|f_\omega(y_k) - h_k\|^2
        ```
   d) **Federated Aggregation**:
      - [Central Nodes] Aggregate models using weighted average:
        ```math
        \omega_{t+1} = \omega_t - \eta_t \sum_{m\in\mathcal{M}_t} \left(\frac{\alpha_m}{\sum_i \alpha_i}\right) g(\omega^l_{m,t})
        ```
        Where:
        - $\omega_{t+1}$: Updated global model parameters
        - $\omega_t$: Current global model parameters
        - $\eta_t$: Learning rate at iteration $t$
        - $\mathcal{M}_t$: Set of active UEs in round $t$
        - $\alpha_m$: Weight for UE $m$'s contribution
        - $g(\omega^l_{m,t})$: Gradient from UE $m$'s local model
   e) **Model Distillation**:
      - [Central Nodes] Distill global model $W_g$ to $W_f$:
        ```math
        W_f = \text{distill}(W_g)
        ```

3. **Convergence Check**:
   - Evaluate channel estimation accuracy (NMSE)
   - Repeat FL rounds until convergence or max epochs reached

## FL Processes
1. **FL User Group Selection**: Central node identifies active UEs for FL.
2. **Model Broadcast**: CN broadcasts current global model ω^g_t to active UEs.
3. **Local Gradient Calculation**: Each active UE calculates local gradient g(ω^l_m,t) = ∇L(ω^g_t, D_m).
4. **Model Aggregation**: CN computes weighted aggregate of local gradients:
   ```math
   r_t ≜ ∑_{m∈M̂_t} (α_m / ∑_{i∈M̂_t} α_i) g(ω^l_m,t)
   ```
5. **Global Model Update**: 
   ```math
   ω_{t+1} = ω_t - η_t r_t
   ```

## Techniques

### Heterogeneous FL (HFL)
1. Global model W_g is decomposed into shared part W^1_g and distillation part W^2_g.
2. Shared part aggregation:
   ```math
   W^1_g = (∑_{l=1}^L β_l W^1_l)/L
   ```
3. Only shared parameters are transmitted, reducing communication overhead.

### Transfer Learning
1. **Distance-similar (Dis)**: 
   ```math
   α'_m = {1 - L_m/L, if L_m ≤ L; 0, otherwise}
   ```
2. **RSRP+Dis**:
   ```math
   α''_m = {(1 - |P_m - P_center|/2Δ)α'_m, if P_center - Δ < P_m < P_center + Δ; 0, otherwise}
   ```

### Coalition Formation Game
Modeled as G = {K, U(S), S} where:
- K: Set of UEs
- S: Coalition structure
- U(S): Utility of coalition

Utility function:
```math
U = ∑_{S_j∈S} U(S_j) = ∑_{S_j∈S} (A - ∑_{p=1}^P e_j,p)
```

### DRL Approaches
1. **DQN-enabled**:
   - State: S_t = {C_t, D_t} (coalition choices and sizes)
   - Action: A_t = {C_t} (coalition choices)
   - Reward: R_t = 1 - e (average channel estimation accuracy)

2. **Qmix-enabled**:
   - Distributed framework where each user makes independent decisions
   - Combines individual value functions via mixing network

## Weaknesses
1. **Performance trade-off**: HFL shows slight reduction in accuracy (∼3%) compared to homogeneous FL.
2. **RIS size impact**: Channel estimation accuracy decreases with increasing RIS elements.
3. **Model complexity**: Performance degrades with smaller neural networks (14.1% NMSE decrease with 4 conv layers vs 5).
4. **Convergence time**: DRL training requires multiple epochs to converge.
5. **Assumption limitations**: Perfect knowledge of Φ and F_k may not hold in practice.
