# Analysis of "Coalitional Federated Learning: Improving Communication and Training on Non-IID Data With Selfish Clients"

## Motivations
The paper addresses three key challenges in Federated Learning (FL):
1. **Non-IID data distribution** across clients due to heterogeneous local data
2. **Communication bottleneck** from frequent model exchanges between server and clients
3. **Selfish clients** that seek to obtain global models without fully contributing to training

## Objectives
The paper aims to:
- Mitigate non-IID data effects through coalition-level data sharing
- Reduce communication overhead via local aggregations within coalitions
- Detect and minimize participation of selfish clients using trust mechanisms
- Form stable coalitions of trustworthy clients for more effective FL

## Notations (Symbol:Description)
- $I = \{i_1...i_n\}$: Set of IoT devices (clients)
- $R = \{CPU, RAM, BW\}$: Resource metrics for each device
- $G = (I, E, Trust)$: Directed graph representing device relationships
- $Trust(i_k, i_j)$: Trust value from device $i_k$ to $i_j$
- $D_Q = \{D_q^1...D_q^n\}$: Dataset distributed across clients
- $U_i(C)$: Utility function for device $i$ in coalition $C$
- $P_i(C)$: Preference function for device $i$ regarding coalition $C$
- $Z = \{C_1,...,C_j\}$: Coalition structure partitioning devices
- $Score(CMS_i)$: Score for device $i$ to be coalition master

## Assumptions
1. Devices have varying but measurable computational resources (CPU, RAM, bandwidth)
2. Trust relationships between devices can be established and quantified
3. Selfish clients underutilize resources but don't actively attack the system
4. Data distribution is non-IID by nature of local data collection
5. Communication between server and clients is a significant bottleneck

## Main Workflow (Detailed)
The paper proposes a four-phase workflow for Coalitional Federated Learning that combines mathematical rigor with practical implementation:

### 1. Trust Establishment Phase
This phase creates a robust trust network among devices using both social relationships and objective metrics.

**Subjective Trust (Algorithm 1):**
The system builds a web of trust recommendations using a DFS-based discovery algorithm with the following initialization and propagation:

1. **Initial Trust Values:**
   - The paper doesn't specify exact initial values but describes:
     * First-time participants start with "initial trust values" (Section IV-A)
     * Existing participants use historical records of past FL collaborations
     * Server bootstraps trust using device registration information
   - In practice, neutral starting points (like 0.5) are common in trust systems, though not explicitly stated here

2. **Trust Establishment:**
   The paper establishes trust through:
   - Subjective trust from social relationships (Algorithm 1)
   - Objective trust from resource monitoring (Algorithm 2)
   - No explicit trust update mechanism is described
   - Trust values appear to be recalculated in each round based on current:
     * Social recommendations
     * Resource utilization patterns

3. **Recommendation Aggregation:**
   $$Rec_i = \frac{1}{n}\sum_{k=1}^n Trust(i_k, i_j)$$
   where $n$ is number of recommenders, weighted by their own trust scores

**Objective Trust (Algorithm 2):**
The system calculates objective trust $\tau_i$ for each device $i$ based on resource utilization patterns:

1. **Resource Monitoring:**
   - Tracks CPU, RAM, and bandwidth usage over time
   - Computes percentiles for each resource $r \in R$:
     $$Q1_r = 25^{th}\ percentile,\ Q3_r = 75^{th}\ percentile$$
     $$IQR_r = Q3_r - Q1_r$$
     $$LL_r = Q1_r - 1.5 \times IQR_r$$

2. **Selfishness Detection:**
   For each resource $r$, compute deviation score:
   $$d_{i,r} = \max(0, LL_r - u_{i,r})/LL_r$$
   where $u_{i,r}$ is device $i$'s utilization of resource $r$

3. **Composite Objective Trust:**
   $$\tau_i = 1 - \frac{1}{|R|}\sum_{r \in R} w_r \cdot d_{i,r}$$
   where:
   - $w_r$ is the weight for resource $r$ (normalized: $\sum w_r = 1$)
   - $|R|$ is number of monitored resources

Devices with $\tau_i < 0.25$ are flagged as potentially selfish, indicating consistent underutilization across multiple resources.

**Bayesian Aggregation (Equation 1):**
The final trust score combines both subjective and objective measures:
$$Trust_i = \frac{n\tau_i + Rec_i}{2n}$$
This balanced approach prevents gaming the system - devices can't fake trust through social connections alone, nor can they hide selfish behavior behind good hardware specs.

### 2. Coalition Formation Phase (Algorithm 3)
This phase organizes devices into collaborative groups using game theory principles.

**Hedonic Game Formulation:**
Devices act as rational players seeking to maximize their utility:
$$U_i(C) = \sum_{j \in C} Trust_j^i$$
The utility represents the sum of trust scores within a coalition - higher trust means more reliable partners and better model quality. This creates natural incentives for devices to seek trustworthy collaborators.

**Preference Function (Equation 4):**
$$P_i(C) = \begin{cases} 
-\infty, & \text{if selfish members exist} \\
0, & \text{if } C \in history \\
U_i(C), & \text{otherwise}
\end{cases}$$
This function enforces three key rules:
1. Absolute avoidance of coalitions with known selfish devices
2. Neutral preference for previously abandoned coalitions
3. Strong preference for high-trust coalitions otherwise

**Stability Analysis:**
The algorithm guarantees convergence to:
1. Nash equilibrium - No device can unilaterally improve its position
2. Individual stability - No mutually beneficial transfers exist
3. Selfish isolation - Free-riders end up in singleton coalitions

The proof relies on:
- Finite number of possible partitions
- Monotonic improvement in each iteration
- Acyclicity of the preference graph

### 3. Coalition Master Election (Algorithm 4)
Each coalition elects a leader responsible for coordination and communication.

**Scoring Function (Equation 5):**
$$Score(CMS_i) = \sum_{r \in R} w_r \times r_i$$
where:
- $R = \{CPU, RAM, BW, (1-LC)\}$ represents critical resources
- $w_r$ are normalized weights ($\sum w_r = 1$) that can be tuned based on application needs
- $LC$ is normalized latency to server [0,1]

**Key Responsibilities:**
1. **Model Aggregation**: Performs weighted averaging of member models:
   $$w_{coalition} = \frac{1}{|C|}\sum_{i \in C} w_i$$
2. **Communication Hub**: Reduces server connections from O(n) to O(k), where k is number of coalitions
3. **Data Sharing**: The paper describes (Section IV-C) that coalitions help mitigate non-IID data issues through:
   - Members sharing representative data samples within their coalition
   - Privacy-preserving techniques for data exchange
   - No specific data sharing ratio or CM responsibilities are detailed

**Election Process:**
1. Resource declaration: Devices share $(CPU, RAM, BW, LC)$
2. Score calculation: Using weighted sum of normalized resources
3. Verification: Cross-check declared resources against historical usage
4. Announcement: Highest scorer becomes CM, runner-up as backup

**Design Considerations:**
- Weights can prioritize compute (CPU/RAM) or network (BW/LC) based on FL task
- Periodic re-elections handle dynamic resource availability
- Verification prevents gaming the election with false claims

### 4. Federated Training Phase
This phase implements the actual learning process with communication optimizations.

**Data Sharing Protocol:**
- The paper describes (Section IV-C) that coalitions help address non-IID data through:
  * Members sharing representative data samples within their coalition
  * Privacy-preserving techniques for data exchange
  * No specific sharing mechanism or percentage is provided

**Local Training Process:**
Each device performs:
1. Data combination:
   $$D_{train} = D_{local} \cup D_{shared}$$
2. Model training using standard SGD:
   $$\theta_{i}^{t+1} = \theta_{i}^{t} - \eta \nabla \mathcal{L}(\theta_{i}^{t})$$
   where $\eta$ is learning rate and $\mathcal{L}$ is loss function

**Two-Level Aggregation:**
1. Local Aggregation (at CM):
   $$w_{coalition} = \frac{1}{|C|}\sum_{i \in C} w_i$$
   - Performed every $k$ local iterations
   - Reduces communication frequency with server

2. Global Aggregation (at server):
   $$w_{global} = \frac{1}{K}\sum_{k=1}^K w_{coalition}^k$$
   where $K$ is number of active coalitions
   - Weighted by coalition size and trust scores
   - Includes momentum term for stability

**Communication Benefits:**
- Reduces server connections from $O(n)$ to $O(K)$
- Local aggregations decrease global rounds needed
- Smaller models transmitted (only coalition-level)

## Techniques and Formulas

### Trust Aggregation
$$Trust_i = \sum_{t=1}^n \frac{n\tau_i + Rec_i}{2n}$$

Where:
- $Trust_i$: Final trust score for device $i$
- $\tau_i$: Objective trust value
- $Rec_i$: Subjective trust recommendations
- $n$: Number of recommendations

### Coalition Utility
$$U_i(C) = \sum_{j \in C} Trust_j^i$$

### Coalition Master Score
$$Score(CMS_i) = (w_{cpu} \times CPU_i) + (w_{ram} \times RAM_i) + (w_{BW} \times BW_i) + (w_{LC} \times (1 - LC_{i,CS}))$$

### Preference Function
$$P_i(C) = 
\begin{cases} 
-\infty, & \text{if } C \text{ has selfish members} \\
0, & \text{if } C \in h_i(t) \\
U_i(C), & \text{otherwise}
\end{cases}$$

## Weaknesses
1. **Straggler devices** are not considered (only selfish ones)
2. **Trust establishment overhead** from recommendation collection
3. **Fixed threshold** (0.25) may not adapt to different environments
4. **Coalition stability** depends on static trust relationships
5. **Active attacks** (like poisoning) are not addressed
6. **Resource monitoring** may have privacy implications
7. **CM election** doesn't consider dynamic resource changes during FL

## Key Contributions
1. First solution jointly addressing non-IID data, communication efficiency, and selfish clients
2. Novel client-to-client trust establishment mechanism
3. Trust-enabled coalition formation game with proven stability
4. Experimental validation showing:
   - 4-5x reduction in selfish clients vs Vanilla-FL
   - 10-40% accuracy improvement
   - Effective communication reduction via coalition masters
