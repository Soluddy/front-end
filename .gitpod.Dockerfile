FROM gitpod/workspace-full

# Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.17.3/install)"

# Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:$PATH"

# Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
