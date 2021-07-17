import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should create a deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'name',
      email: 'email',
      password: 'password',
    })

    if (user.id) {
      const response = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 10,
        description: 'description'
      });

      expect(response).toHaveProperty('id');
    }
  });

  it('should create a withdraw statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'name',
      email: 'email',
      password: 'password',
    })

    if (user.id) {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'description'
      });

      const response = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 10,
        description: 'description'
      });

      expect(response).toHaveProperty('id');
    }
  });

  it('should return error if balance lower then amount', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'name',
        email: 'email',
        password: 'password',
      })

      if (user.id) {
        await createStatementUseCase.execute({
          user_id: user.id,
          type: OperationType.WITHDRAW,
          amount: 10,
          description: 'description'
        });
      }
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should throw user not found', async () => {
    expect(async () => {
      const user_id = 'not-exists';

      const statement = await inMemoryStatementsRepository.create({
        amount: 1,
        description: 'description',
        type: OperationType.DEPOSIT,
        user_id,
      })

      if (statement.id) {
        await createStatementUseCase.execute({
          user_id,
          type: OperationType.WITHDRAW,
          amount: 10,
          description: 'description'
        });
      }
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
