import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as pactum from 'pactum';
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import { AuthDto } from "../src/auth/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "../src/bookmark/dto";
import { EditUserDto } from "../src/user/dto";
import {ConfigService} from "@nestjs/config";
import { User } from "@prisma/client";

describe ('App e2e', ()=>{
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeAll( async ()=>{
    const moduleRef = 
    await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist:true,
      })
    )

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(
      'http://localhost:3333')
  })

  afterAll(()=>{
    app.close();
  });
  
  describe('Auth',()=>{
    const dto: AuthDto = {
      email : 'test1@gmail.com',
      password: 'testpassword',
    };
    const dto2: AuthDto = {
      email : 'test2@gmail.com',
      password: 'test2password',
    };
    describe('Signup',()=>{
      it('should throw if email empty', async ()=>{
        const {password} = dto;

        return pactum
        .spec()
        .post(
          '/auth/signup',
        ).withBody({
          password:password,
        })
        .expectStatus(400);
      });

      it('should throw if password empty', async ()=>{
        const {email}= dto;

        return pactum
        .spec()
        .post(
          '/auth/signup',
        ).withBody({
          email:email,
        })
        .expectStatus(400);
      });

      it('should throw if no dto', async ()=>{

        return pactum
        .spec()
        .post(
          '/auth/signup',
        )
        .expectStatus(400);
      });

      it('should signup', ()=>{
        return pactum
        .spec()
        .post(
          '/auth/signup',
        ).withBody(dto)
        .stores('userId1', 'id')
        .expectStatus(201);


    
      });

      it('should signup second user', ()=>{
        return pactum
        .spec()
        .post(
          '/auth/signup',
        ).withBody(dto2)
        .stores('userId2', 'id')
        .expectStatus(201);

      });
    });
    describe('Signin',()=>{
      it('should throw if email empty', async ()=>{
        const {password} = dto;
        return pactum
        .spec()
        .post(
          '/auth/signin',
        ).withBody({
          password:password,
        })
        .expectStatus(400);
      });

      it('should throw if password empty', async ()=>{
        const {email}= dto;

        return pactum
        .spec()
        .post(
          '/auth/signin',
        ).withBody({
          email:email,
        })
        .expectStatus(400);
      });

      it('should throw if no dto', async ()=>{

        return pactum
        .spec()
        .post(
          '/auth/signin',
        )
        .expectStatus(400);
      });

      it('should signin',()=>{
        return pactum
        .spec()
        .post(
          '/auth/signin',
        ).withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', ()=>{
    describe('Get me', ()=>{
      it('should get me current user', ()=>{
        return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
         },)
        .expectStatus(200);
      })
    });
    describe('Edit User', ()=>{
      it('should edit user', ()=>{
        const dto:EditUserDto = {
          firstName: "testuserfirstname",
          lastName:"testuserlastname"
        }
        return pactum
        .spec()
        .patch('/users')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.lastName);
      })      
    });
  });

  describe('Bookmarks',()=>{

    describe('Get Empty bookmarks', ()=>{
      it('should return Empty bookmarks', ()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(0)
      })
    });

    describe('Create bookmarks', ()=>{
      it('create a bookmark',()=>{
        const dto:CreateBookmarkDto ={
          title:"test bookmark",
          link:"test link"
        }

        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id');
      })

      it('create a second bookmark',()=>{
        const dto:CreateBookmarkDto ={
          title:"second test bookmark",
          link:"second test link"
        }

        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('secondBookmarkId', 'id');
      })

    });

    describe('Get bookmarks', ()=>{
      it('should return bookmarks', ()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(2)
      })
    });

    describe('Get bookmark by id', ()=>{
      it("return bookmark by id", ()=>{
  
        return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id','$S{bookmarkId}')
        .withHeaders({
          'Authorization':'Bearer $S{userAt}'
        })
        .expectStatus(200)

      })
    });

    describe('Edit bookmark by id',()=>{
      it('edit bookmark by id', ()=>{
        const dto: EditBookmarkDto = {
          title: "edited_title",
          description: 'has been edited',
        };

        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id','$S{bookmarkId}')
          .withHeaders({
            "Authorization":"Bearer $S{userAt}"
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('edited_title')
          .expectBodyContains('has been edited')
      })
    });

    describe('Delete bookmark by id', ()=>{
      it('should delete bookmark',()=>{
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id','$S{bookmarkId}')
          .withHeaders({
            "Authorization":"Bearer $S{userAt}"
          })
          .expectStatus(200)
        });
        it('should return one bookmark', ()=>{
          return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            'Authorization':'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1)
        })
    });

  })

  describe("Users_delete",()=>{
    describe("Should delete the signed in user",()=>{
      it('should signin',()=>{
        const dto: AuthDto = {
          email : 'test1@gmail.com',
          password: 'testpassword',
        };
        return pactum
        .spec()
        .post(
          '/auth/signin',
        ).withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      });

      it("Should Show three users",()=>{
        pactum
          .spec()
          .get('/users')
          .withHeaders({
            "Authorization":"Bearer $S{userAt}"
          })
          .expect((response)=>{
            console.log("response when we get users",response)
          })
          .expectBodyContains("admin@admin.com")
          .expectStatus(200)
          .expectJsonLength(3)
                  
      })
      
      it("should show the signed in user", ()=>{
        return pactum
        .spec()
        .get("/users")
        .withHeaders({
          "Authorization":"Bearer $S{userAt}"
        })
        .expectStatus(200)
        .expectBodyContains("test1@gmail.com")
      })
      
      it("Should delete the signed in user", ()=>{
        return pactum
        .spec()
        .delete('/users')
        .withHeaders({
          "Authorization":"Bearer $S{userAt}"
        })
        .expectStatus(200)
        .expectBodyContains("test1@gmail.com")
        
      })

      it("Should sign in as the remaining user : test 2",()=>{
        const dto: AuthDto = {
          email : 'test2@gmail.com',
          password: 'test2password',
        };
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .stores('userAt2', 'access_token')
        .expectStatus(200)
        .expectBodyContains("access_token")
      })

      it("Should Show two users",()=>{
        pactum
          .spec()
          .get('/users')
          .withHeaders({
            "Authorization":"Bearer $S{userAt2}"
          })
          .expectBodyContains("admin@admin.com")
          .expectBodyContains('test2@gmail.com')
          .expectStatus(200)
          .expectJsonLength(2)
                  
      });

      it("Should throw",()=>{
        pactum
          .spec()
          .get('/users')
          .withHeaders({
            "Authorization":"Bearer $S{userAt2}"
          })
          .expectBodyContains("admin@admin.com")
          .expectBodyContains('test2@gmail.com')
          .expectBodyContains("test1@gmail.com")
          .expectStatus(200)
          .expectJsonLength(4)
                  
      });
      
    })

    describe("Should Delete all users", ()=>{
      it("Should Signup new user", ()=>{

        return pactum
        .spec()
        .post(
          '/auth/signup',
        ).withBody({email:"3rdtestuser@mail.com", password:"3rdtestuserpassword"})
        .stores('userId2', 'id')
        .expectStatus(201);
      })

      it("Should Signin new user", ()=>{

        return pactum
        .spec()
        .post(
          '/auth/signin',
        ).withBody({email:"3rdtestuser@mail.com", password:"3rdtestuserpassword"})
        .stores('userAt3', 'access_token')
        .expectStatus(200);
      })

      it("should show three users including admin", ()=>{
        
        return pactum.spec()
          .get('/users')
          .expectStatus(200)
          .withHeaders({
            "Authorization":"Bearer $S{userAt3}"
          })
          .expectJsonLength(3)
          .expectBodyContains("admin@admin.com") 
      })
      
      it("should sign in the admin user", ()=>{
        const dto = {email:"admin@admin.com", password: "even-more-secret"};
        // const config = new ConfigService;
        // const adminPassword: string = config.get("ADMIN_PASSWORD");
        // console.log(adminPassword);
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .stores("adminAt", "access_token")
        .expectStatus(200)
      })

      it("should delete test user 3 while being signed in as the admin", ()=>{

        return pactum.spec()
        .delete("/users/admin/{id}")
        .withPathParams('id','$S{userId2}')
        .withHeaders({"Authorization":"Bearer $S{adminAt}"})
        .expectStatus(200)
      })

      it('should show two users', ()=>{

        return pactum
          .spec()
          .get('/users/')
          .withHeaders({
            'Authorization':'Bearer $S{adminAt}'
          })
          .expectStatus(200)
          .expectJsonLength(2)
          .expectBodyContains("admin@admin.com")
      })
    })
  })
}) 