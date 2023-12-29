import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleReader } from 'ton-core';

export type Task4BasicConfig = {};

export function task4BasicConfigToCell(config: Task4BasicConfig): Cell {
    return beginCell().endCell();
}

export class Task4Basic implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task4Basic(address);
    }

    static createFromConfig(config: Task4BasicConfig, code: Cell, workchain = 0) {
        const data = task4BasicConfigToCell(config);
        const init = { code, data };
        return new Task4Basic(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getSolve(provider: ContractProvider, maze: string[]): Promise<[bigint, bigint, bigint, TupleReader]> {
        const { stack } = await provider.get('solve', [
            {
                type: "int",
                value: BigInt(maze.length)
            },
            {
                type: "int",
                value: BigInt(maze[0].length)
            },
            {
                type: "tuple",
                items: maze.map(row => ({
                    type: "slice",
                    cell: beginCell().storeStringTail(row).endCell(),
                })),
            },
        ]);
        return [stack.readBigNumber(), stack.readBigNumber(), stack.readBigNumber(), stack.readTuple()];
    }
}
