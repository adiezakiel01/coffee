--
-- PostgreSQL database dump
--

\restrict ybS3vs3y0DwB9mKv07cMypbaOZl6LHT2zPeadY6Icq5hhngbtfQ5lhK824yeRf4

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: coffee_database_xshh_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO coffee_database_xshh_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO coffee_database_xshh_user;

--
-- Name: bags; Type: TABLE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE TABLE public.bags (
    id integer NOT NULL,
    bean_id integer NOT NULL,
    roast_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bags OWNER TO coffee_database_xshh_user;

--
-- Name: bags_id_seq; Type: SEQUENCE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE SEQUENCE public.bags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bags_id_seq OWNER TO coffee_database_xshh_user;

--
-- Name: bags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coffee_database_xshh_user
--

ALTER SEQUENCE public.bags_id_seq OWNED BY public.bags.id;


--
-- Name: beans; Type: TABLE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE TABLE public.beans (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    roaster character varying(255),
    origin character varying(255),
    process character varying(100),
    tasting_notes text,
    roast_date date,
    created_at timestamp without time zone NOT NULL,
    continent character varying(100),
    region character varying(255),
    farm character varying(255),
    variety character varying(255),
    altitude integer
);


ALTER TABLE public.beans OWNER TO coffee_database_xshh_user;

--
-- Name: beans_id_seq; Type: SEQUENCE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE SEQUENCE public.beans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beans_id_seq OWNER TO coffee_database_xshh_user;

--
-- Name: beans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coffee_database_xshh_user
--

ALTER SEQUENCE public.beans_id_seq OWNED BY public.beans.id;


--
-- Name: brew_parameters; Type: TABLE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE TABLE public.brew_parameters (
    id integer NOT NULL,
    brew_id integer NOT NULL,
    key character varying(100) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.brew_parameters OWNER TO coffee_database_xshh_user;

--
-- Name: brew_parameters_id_seq; Type: SEQUENCE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE SEQUENCE public.brew_parameters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brew_parameters_id_seq OWNER TO coffee_database_xshh_user;

--
-- Name: brew_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coffee_database_xshh_user
--

ALTER SEQUENCE public.brew_parameters_id_seq OWNED BY public.brew_parameters.id;


--
-- Name: brews; Type: TABLE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE TABLE public.brews (
    id integer NOT NULL,
    bean_id integer,
    brewed_at timestamp with time zone NOT NULL,
    grind_size character varying(50),
    water_temp_celsius numeric(4,1),
    coffee_grams numeric(5,1),
    water_grams numeric(6,1),
    bloom_time_seconds integer,
    total_time_seconds integer,
    notes text,
    created_at timestamp with time zone NOT NULL,
    rating smallint,
    brew_type character varying(10),
    filter_type character varying(20),
    ice_grams integer,
    flavor_tags character varying[],
    bag_id integer
);


ALTER TABLE public.brews OWNER TO coffee_database_xshh_user;

--
-- Name: brews_id_seq; Type: SEQUENCE; Schema: public; Owner: coffee_database_xshh_user
--

CREATE SEQUENCE public.brews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brews_id_seq OWNER TO coffee_database_xshh_user;

--
-- Name: brews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: coffee_database_xshh_user
--

ALTER SEQUENCE public.brews_id_seq OWNED BY public.brews.id;


--
-- Name: bags id; Type: DEFAULT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.bags ALTER COLUMN id SET DEFAULT nextval('public.bags_id_seq'::regclass);


--
-- Name: beans id; Type: DEFAULT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.beans ALTER COLUMN id SET DEFAULT nextval('public.beans_id_seq'::regclass);


--
-- Name: brew_parameters id; Type: DEFAULT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brew_parameters ALTER COLUMN id SET DEFAULT nextval('public.brew_parameters_id_seq'::regclass);


--
-- Name: brews id; Type: DEFAULT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brews ALTER COLUMN id SET DEFAULT nextval('public.brews_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: coffee_database_xshh_user
--

COPY public.alembic_version (version_num) FROM stdin;
e015d05f9b85
\.


--
-- Data for Name: bags; Type: TABLE DATA; Schema: public; Owner: coffee_database_xshh_user
--

COPY public.bags (id, bean_id, roast_date, created_at) FROM stdin;
1	1	2026-04-27	2026-07-27 10:34:57.274952+00
2	2	2026-04-27	2026-07-27 10:35:27.048683+00
3	3	2026-06-25	2026-07-28 09:11:49.069594+00
\.


--
-- Data for Name: beans; Type: TABLE DATA; Schema: public; Owner: coffee_database_xshh_user
--

COPY public.beans (id, name, roaster, origin, process, tasting_notes, roast_date, created_at, continent, region, farm, variety, altitude) FROM stdin;
1	Aceh Gayo	\N	Aceh, Indonesia	\N	\N	\N	2026-07-08 11:06:51.732325	Asia-Pacific	\N	\N	\N	\N
2	Mandheling	\N	Indonesia 	\N	\N	\N	2026-07-08 13:20:36.07773	Asia-Pacific	\N	\N	\N	\N
3	Yunnan	\N	China	\N	\N	\N	2026-07-28 09:11:49.069145	Asia-Pacific	\N	\N	\N	\N
\.


--
-- Data for Name: brew_parameters; Type: TABLE DATA; Schema: public; Owner: coffee_database_xshh_user
--

COPY public.brew_parameters (id, brew_id, key, value) FROM stdin;
\.


--
-- Data for Name: brews; Type: TABLE DATA; Schema: public; Owner: coffee_database_xshh_user
--

COPY public.brews (id, bean_id, brewed_at, grind_size, water_temp_celsius, coffee_grams, water_grams, bloom_time_seconds, total_time_seconds, notes, created_at, rating, brew_type, filter_type, ice_grams, flavor_tags, bag_id) FROM stdin;
1	1	2026-07-08 11:07:42.224455+00	Medium	93.0	23.0	200.0	45	180	Juicy, Grapes, smooth	2026-07-08 11:07:42.22446+00	9	iced	cone	150	{Grape,Winey}	1
2	2	2026-07-08 13:24:04.212525+00	Medium	93.0	23.0	200.0	45	180	Citrusy, woody	2026-07-08 13:24:04.212531+00	8	iced	cone	150	{Woody,Fig}	2
3	1	2026-07-10 14:06:42.914443+00	Medium-fine	93.0	17.0	270.0	50	250	\N	2026-07-10 14:06:42.914449+00	6	hot	cone	\N	{Grape,Winey}	1
4	3	2026-07-28 09:13:13.169102+00	Medium-fine	94.0	20.0	250.0	45	180	Could grind coarser	2026-07-28 09:13:13.169107+00	8	hot	flat	\N	{Lemon,Jasmine}	3
\.


--
-- Name: bags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coffee_database_xshh_user
--

SELECT pg_catalog.setval('public.bags_id_seq', 4, true);


--
-- Name: beans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coffee_database_xshh_user
--

SELECT pg_catalog.setval('public.beans_id_seq', 3, true);


--
-- Name: brew_parameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coffee_database_xshh_user
--

SELECT pg_catalog.setval('public.brew_parameters_id_seq', 1, false);


--
-- Name: brews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coffee_database_xshh_user
--

SELECT pg_catalog.setval('public.brews_id_seq', 4, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: bags bags_pkey; Type: CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.bags
    ADD CONSTRAINT bags_pkey PRIMARY KEY (id);


--
-- Name: beans beans_pkey; Type: CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.beans
    ADD CONSTRAINT beans_pkey PRIMARY KEY (id);


--
-- Name: brew_parameters brew_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brew_parameters
    ADD CONSTRAINT brew_parameters_pkey PRIMARY KEY (id);


--
-- Name: brews brews_pkey; Type: CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_pkey PRIMARY KEY (id);


--
-- Name: bags bags_bean_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.bags
    ADD CONSTRAINT bags_bean_id_fkey FOREIGN KEY (bean_id) REFERENCES public.beans(id) ON DELETE CASCADE;


--
-- Name: brew_parameters brew_parameters_brew_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brew_parameters
    ADD CONSTRAINT brew_parameters_brew_id_fkey FOREIGN KEY (brew_id) REFERENCES public.brews(id) ON DELETE CASCADE;


--
-- Name: brews brews_bag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_bag_id_fkey FOREIGN KEY (bag_id) REFERENCES public.bags(id) ON DELETE SET NULL;


--
-- Name: brews brews_bean_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coffee_database_xshh_user
--

ALTER TABLE ONLY public.brews
    ADD CONSTRAINT brews_bean_id_fkey FOREIGN KEY (bean_id) REFERENCES public.beans(id) ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO coffee_database_xshh_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO coffee_database_xshh_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO coffee_database_xshh_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO coffee_database_xshh_user;


--
-- PostgreSQL database dump complete
--

\unrestrict ybS3vs3y0DwB9mKv07cMypbaOZl6LHT2zPeadY6Icq5hhngbtfQ5lhK824yeRf4

