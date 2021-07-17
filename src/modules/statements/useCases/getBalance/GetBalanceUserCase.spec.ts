import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it('should return balance without statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'name',
      email: 'email',
      password: 'password',
    })

    if (user.id) {
      const response = await getBalanceUseCase.execute({
        user_id: user.id,
      });

      expect(response).toHaveProperty('balance');
    }
  });

  it('should return balance with statement', async () => {
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
        const response = await getBalanceUseCase.execute({
          user_id: user.id,
        });

        expect(response).toHaveProperty('balance');
        expect(response).toHaveProperty('statement');
      }
    }
  });

  it('should throw get balance error', async () => {
    expect(async () => {
      const user_id = 'not-exists';

      await getBalanceUseCase.execute({
        user_id,
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
