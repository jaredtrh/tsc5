import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from 'ton-core';

export type Task2Config = {
    adminAddress: Address,
    users: Dictionary<Address, number>,
};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell()
        .storeAddress(config.adminAddress)
        .storeDict(config.users)
        .endCell();
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendAddUser(provider: ContractProvider, via: Sender, value: bigint, address: Address, share: number) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x368ddef3, 32)
                .storeUint(0, 64)
                .storeAddress(address)
                .storeUint(share, 32)
                .endCell(),
        });
    }

    async sendRemoveUser(provider: ContractProvider, via: Sender, value: bigint, address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x278205c8, 32)
                .storeUint(0, 64)
                .storeAddress(address)
                .endCell(),
        });
    }

    async sendSplitTon(provider: ContractProvider, via: Sender, value: bigint, amount: number | bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x068530b3, 32)
                .storeUint(0, 64)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async sendTransferNotification(provider: ContractProvider, via: Sender, value: bigint, amount: number | bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x7362d09c, 32)
                .storeUint(0, 64)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async getUsers(provider: ContractProvider): Promise<Cell> {
        const { stack } = await provider.get('get_users', []);
        return stack.readCell();
    }

    async getUserShare(provider: ContractProvider, userAddress: Address): Promise<number> {
        const { stack } = await provider.get('get_user_share', [
            { type: "slice", cell: beginCell().storeAddress(userAddress).endCell() }
        ]);
        return stack.readNumber();
    }
}
