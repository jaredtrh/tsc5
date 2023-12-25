import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from 'ton-core';

export type Task2Config = {
    admin_address: Address,
    users: Dictionary<Address, number>,
};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell()
        .storeAddress(config.admin_address)
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
