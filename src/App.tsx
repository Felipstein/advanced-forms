import { useState } from 'react';
import './styles/global.css';

/**
 * Conceitos
 *
 * Validação / transformação
 *
 * Field Arrays (quando você pode adicionar mais um campo, ou remover)
 *
 * Upload de arquivos
 *
 * Composition Pattern
 *
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createUserFormSchema = z.object({
  name: z.string()
    .nonempty('Nome é obrigatório')
    .transform(name => name.trim().split(' ').map(word => word[0].toLocaleUpperCase().concat(word.substring(1))).join(' ')),
  email: z.string()
    .nonempty('E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  // .refine(email => email.endsWith('@gmail.com'), 'E-mail precisa ser da G-Mail'),
  password: z.string()
    .min(6, 'Mínimo 6 caracteres'),
  // confirmPassword: z.string()
  //   .superRefine((password, context) => console.log(password, context)),
  techs: z.array(z.object({
    title: z.string().nonempty('Título obrigatório'),
    knowledge: z.coerce.number().min(1, 'Mínimo 1').max(10, 'Máximo 10'), // coerce pega o campo de texto e transforma em número, caso seja possível
  }))
    .min(2, 'Insira pelo menos duas tecnologias')
    .refine(techs => {
      return techs.some(tech => tech.knowledge > 5);
    }, 'Para cadastrar, você deve pelo menos ter um conhecimento sobre alguma tecnologia que esteja acima de 5'),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export const App: React.FC = () => {
  const [output, setOutput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    name: 'techs',
    control,
  });

  function addNewTech() {
    append({ title: '', knowledge: 0 });
  }

  function removeTech(index: number) {
    remove(index);
  }

  function createUser(data: CreateUserFormData) {
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className='h-screen bg-zinc-950 text-zinc-300 flex flex-col gap-10 items-center justify-center'>
      <form
        onSubmit={handleSubmit(createUser)}
        className='flex flex-col gap-4 w-full max-w-xs'
      >
        <div className='flex flex-col gap-1'>
          <label htmlFor='name'>Nome</label>
          <input
            type='text'
            className='border border-zinc-800 bg-zinc-900 shadow-sm rounded h-10 px-3'
            { ...register('name') }
          />
          {errors.name && (
            <span className='text-red-500 text-sm'>
              {errors.name.message}
            </span>
          )}
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='email'>E-mail</label>
          <input
            type='email'
            className='border border-zinc-800 bg-zinc-900 shadow-sm rounded h-10 px-3'
            { ...register('email') }
          />
          {errors.email && (
            <span className='text-red-500 text-sm'>
              {errors.email.message}
            </span>
          )}
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='password'>Senha</label>
          <input
            type='password'
            className='border border-zinc-800 bg-zinc-900 shadow-sm rounded h-10 px-3'
            { ...register('password') }
          />
          {errors.password && (
            <span className='text-red-500 text-sm'>
              {errors.password.message}
            </span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='techs' className='flex items-center justify-between'>
            Tecnologias

            <button
              type='button'
              onClick={addNewTech}
              className='text-emerald-500 text-sm'
            >
              Adicionar
            </button>
          </label>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className='flex gap-2'>
                <div className='flex-1 flex flex-col gap-1'>
                  <input
                    type='text'
                    className='border border-zinc-800 bg-zinc-900 shadow-sm rounded h-10 px-3'
                    { ...register(`techs.${index}.title`) }
                  />

                  {errors.techs?.[index]?.title && (
                    <span className='text-red-500 text-sm'>
                      {errors.techs?.[index]?.title?.message}
                    </span>
                  )}
                </div>

                <div className='flex-1 flex flex-col gap-1'>
                  <input
                    type='number'
                    className='w-16 border border-zinc-800 bg-zinc-900 shadow-sm rounded h-10 px-3'
                    { ...register(`techs.${index}.knowledge`) }
                  />

                  {errors.techs?.[index]?.knowledge && (
                    <span className='text-red-500 text-sm'>
                      {errors.techs?.[index]?.knowledge?.message}
                    </span>
                  )}
                </div>

                <button
                  type='button'
                  onClick={() => removeTech(index)}
                  className='rounded bg-red-400 px-4 hover:bg-red-500'
                >
                  -
                </button>
              </div>
            );
          })}

          {errors.techs && (
            <span className='text-red-500 text-sm'>
              {errors.techs.message}
            </span>
          )}
        </div>

        <button
          type='submit'
          className='bg-emerald-500 rounded font-medium text-white h-10 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:opacity-20'
          // disabled={!isValid}
        >
          Salvar
        </button>

      </form>

      {output && (
        <pre className='rounded bg-zinc-900 p-4 shadow-sm select-none'>
          {output}
        </pre>
      )}
    </main>
  );
};
