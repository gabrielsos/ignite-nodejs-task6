import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetStatementOperationError } from './GetStatementOperationError';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should return get statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'name',
      email: 'email',
      password: 'password',
    })

    if (user.id) {
      const statement = await inMemoryStatementsRepository.create({
        amount: 1,
        description: 'description',
        type: OperationType.DEPOSIT,
        user_id: user.id,
      })

      if (statement.id) {
        const response = await getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: statement.id,
        });

        expect(response).toHaveProperty('id');
      }
    }
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
        await getStatementOperationUseCase.execute({
          user_id,
          statement_id: statement.id,
        });
      }
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should throw statement not found', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'name',
        email: 'email',
        password: 'password',
      })

      if (user.id) {
        await getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: 'statement.id',
        });
      }
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
