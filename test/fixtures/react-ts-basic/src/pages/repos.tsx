import React from 'react'
import { useFetchRepos } from '../state'

type Repo = {
  id: number
  name: string
  description: string
  stargazers_count: string
}

export default function () {
  const [repos = [], setRepos] = useFetchRepos<Repo[]>()

  const removeRepo = (id: number) => {
    const i = repos.findIndex((item) => item.id === id)
    setRepos(repos.filter((_, index) => index !== i))
  }

  return (
    <>
      <div>
        <h1>VueJs Org Repos</h1>
        {repos.map((repo) => (
          <div
            style={{ padding: '4px', border: '1px solid gray', margin: '4px' }}
            key={repo.name}
          >
            <div>
              <h3 data-test={`name-${repo.name}`}>Name: {repo.name}</h3>
              <div data-test={`desc-${repo.name}`}>
                {repo.description}
                <strong>{repo.stargazers_count} stars</strong>
              </div>
              <button
                onClick={() => removeRepo(repo.id)}
                data-test={`remove-${repo.name}`}
              >
                remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
